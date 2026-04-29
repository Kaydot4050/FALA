import { db, ordersTable, orderEventsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { logger } from "../lib/logger";
import { SupplierService } from "./supplier-service";

export type PaymentStatus = "pending" | "processing" | "completed" | "failed";

export class PaymentService {
  /**
   * Authoritative function to verify and fulfill an order.
   * Handles locking, idempotency, and state transitions.
   */
  static async verifyAndFulfill(orderId: string, source: "webhook" | "frontend" | "reconciler"): Promise<{ success: boolean; message: string; status?: string }> {
    const logPrefix = `[PaymentService:${source}] [Order:${orderId}]`;
    
    try {
      // 1. Fetch current order state
      const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId)).limit(1);
      
      if (!order) {
        logger.error({ orderId, source }, `${logPrefix} Order not found`);
        return { success: false, message: "Order not found" };
      }

      // 2. Idempotency Check: Already completed?
      if (order.status === "completed") {
        logger.info({ orderId, source }, `${logPrefix} Order already completed, skipping fulfillment`);
        return { success: true, message: "Order already completed", status: "completed" };
      }

      // 3. Strict Fulfillment Lock Check
      if (order.fulfillmentStarted) {
        logger.info({ orderId, source }, `${logPrefix} Fulfillment already started/processing by another channel`);
        return { success: true, message: "Fulfillment in progress", status: order.status };
      }

      // 4. Atomic Lock Acquisition
      // We use a single update statement with a strict WHERE clause to ensure only one process wins
      const [lockedOrder] = await db.update(ordersTable)
        .set({ 
          status: "processing", 
          fulfillmentStarted: true,
          updatedAt: new Date(),
          auditLogs: sql`${ordersTable.auditLogs} || ${JSON.stringify([{ 
            timestamp: new Date().toISOString(), 
            event: `Lock acquired via ${source}`,
            source 
          }])}::jsonb` as any
        })
        .where(and(
          eq(ordersTable.id, orderId),
          eq(ordersTable.status, "pending"), // Only transition from pending
          eq(ordersTable.fulfillmentStarted, false) // Double-check lock
        ))
        .returning();

      if (!lockedOrder) {
        // If we couldn't lock, it means another process just won the race
        logger.info({ orderId, source }, `${logPrefix} Could not acquire lock, already being processed`);
        return { success: true, message: "Fulfillment locked by another process", status: "processing" };
      }

      await this.recordEvent(orderId, "verification_started", { source });

      // 5. Verify payment with Paystack
      const secretKey = process.env["PAYSTACK_SECRET_KEY"];
      if (!secretKey) {
        throw new Error("PAYSTACK_SECRET_KEY not configured");
      }

      const paystackRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(orderId)}`, {
        headers: { "Authorization": `Bearer ${secretKey}` }
      });
      
      const paystackData = await paystackRes.json() as any;
      
      if (!paystackData.status || paystackData.data.status !== "success") {
        const paystackStatus = paystackData.data?.status || "unknown";
        logger.warn({ orderId, paystackStatus, source }, `${logPrefix} Paystack verification failed: ${paystackStatus}`);
        
        await this.recordEvent(orderId, "verification_failed", { paystackData });
        
        // If it's a definitive failure, mark as failed. Otherwise, keep as processing or revert if safe.
        // For security, if Paystack says it's not success, we STOP.
        const isDefinitiveFailure = paystackStatus === "failed" || paystackStatus === "reversed";
        
        await db.update(ordersTable)
          .set({ 
            status: isDefinitiveFailure ? "failed" : "pending",
            fulfillmentStarted: false, // Release lock if it wasn't a real payment
            updatedAt: new Date(),
            auditLogs: sql`${ordersTable.auditLogs} || ${JSON.stringify([{ 
              timestamp: new Date().toISOString(), 
              event: `Verification failed (${paystackStatus}), lock released` 
            }])}::jsonb` as any
          })
          .where(eq(ordersTable.id, orderId));

        return { success: false, message: `Payment not confirmed: ${paystackStatus}`, status: isDefinitiveFailure ? "failed" : "pending" };
      }

      // Verify amount (Paystack uses kobo/pesewas)
      const expectedAmountKobo = Math.round(Number(order.amount) * 100);
      const actualAmountKobo = paystackData.data.amount;
      
      if (actualAmountKobo < expectedAmountKobo) {
         logger.error({ orderId, expected: expectedAmountKobo, actual: actualAmountKobo }, `${logPrefix} Amount mismatch!`);
         await this.recordEvent(orderId, "amount_mismatch", { expected: expectedAmountKobo, actual: actualAmountKobo });
         
         await db.update(ordersTable)
          .set({ 
            status: "failed", 
            updatedAt: new Date(),
            auditLogs: sql`${ordersTable.auditLogs} || ${JSON.stringify([{ timestamp: new Date().toISOString(), event: "Amount mismatch detected" }])}::jsonb` as any
          })
          .where(eq(ordersTable.id, orderId));
          
         return { success: false, message: "Amount mismatch", status: "failed" };
      }

      await this.recordEvent(orderId, "payment_verified", { paystackRef: paystackData.data.reference });

      // 6. Fulfill Order via SupplierService
      logger.info({ orderId, phone: order.phoneNumber }, `${logPrefix} Triggering fulfillment via SupplierService`);
      
      const fulfillment = await SupplierService.fulfill(orderId);

      if (fulfillment.success) {
        const finalStatus = (fulfillment as any).isOnHold ? "on_hold" : "completed";
        
        await db.update(ordersTable)
          .set({
            status: finalStatus,
            orderReference: fulfillment.orderReference,
            duplicateDetectionFlag: fulfillment.isDuplicate,
            updatedAt: new Date(),
            auditLogs: sql`${ordersTable.auditLogs} || ${JSON.stringify([{ 
              timestamp: new Date().toISOString(), 
              event: (fulfillment as any).isOnHold 
                ? "Fulfillment ON HOLD by supplier (potential duplicate)" 
                : (fulfillment.isDuplicate ? "Fulfillment confirmed (duplicate)" : "Fulfillment successful"),
              ref: fulfillment.orderReference
            }])}::jsonb` as any
          })
          .where(eq(ordersTable.id, orderId));

        await this.recordEvent(orderId, (fulfillment as any).isOnHold ? "on_hold" : "completion", { 
          orderReference: fulfillment.orderReference, 
          isDuplicate: fulfillment.isDuplicate 
        });
        
        logger.info({ orderId, orderRef: fulfillment.orderReference, finalStatus }, `${logPrefix} Order processed with status: ${finalStatus}`);
        return { success: true, message: `Order ${finalStatus}`, status: finalStatus };
      } else {
        // Fulfillment failed at supplier
        logger.error({ orderId, error: fulfillment.error }, `${logPrefix} Supplier fulfillment failed`);
        
        await this.recordEvent(orderId, "delivery_failed", { error: fulfillment.error });

        // We keep fulfillmentStarted = true to prevent automatic retries by the same mechanism
        // Manual intervention or a specialized reconciler would be needed to reset.
        await db.update(ordersTable)
          .set({ 
            status: "failed", 
            updatedAt: new Date(),
            auditLogs: sql`${ordersTable.auditLogs} || ${JSON.stringify([{ 
              timestamp: new Date().toISOString(), 
              event: `Fulfillment failed: ${fulfillment.error}` 
            }])}::jsonb` as any
          })
          .where(eq(ordersTable.id, orderId));

        return { success: false, message: fulfillment.error || "Fulfillment failed", status: "failed" };
      }

    } catch (error) {
      logger.error({ orderId, error: (error as Error).message }, `${logPrefix} Critical error in verifyAndFulfill`);
      
      try {
        await this.recordEvent(orderId, "system_error", { error: (error as Error).message });
      } catch (e) {}

      return { success: false, message: "Internal system error" };
    }
  }

  private static async recordEvent(orderId: string, eventType: string, eventData: any) {
    try {
      await db.insert(orderEventsTable).values({
        orderId,
        eventType,
        eventData: eventData || {},
      });
    } catch (err) {
      logger.error({ err, orderId, eventType }, "Failed to record order event");
    }
  }
}
