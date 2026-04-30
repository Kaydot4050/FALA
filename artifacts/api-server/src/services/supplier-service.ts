import { datamartFetch } from "../lib/datamart";
import { logger } from "../lib/logger";
import { db, ordersTable, orderEventsTable } from "@workspace/db";
import { eq, and, sql, gt, ne } from "drizzle-orm";

export interface FulfillmentResult {
  success: boolean;
  orderReference?: string;
  error?: string;
  isDuplicate?: boolean;
}

export class SupplierService {
  /**
   * Authoritative fulfillment call to DataMart.
   * Ensures that the request is tracked and errors are handled.
   */
  static async fulfill(orderId: string): Promise<FulfillmentResult> {
    const logPrefix = `[SupplierService] [Order:${orderId}]`;
    const attemptId = crypto.randomUUID();

    try {
      // 1. Fetch current order to get details
      const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId)).limit(1);
      if (!order) {
        return { success: false, error: "Order not found" };
      }

      // 2. Pre-flight check: Already fulfilled?
      if (order.status === "completed" && order.orderReference) {
        logger.info({ orderId }, `${logPrefix} Order already marked as completed with ref: ${order.orderReference}`);
        return { success: true, orderReference: order.orderReference, isDuplicate: true };
      }

      // 3. 5-Minute Guardrail: Check for recent orders for same phone number
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const recentOrders = await db.select()
        .from(ordersTable)
        .where(and(
          eq(ordersTable.phoneNumber, order.phoneNumber),
          gt(ordersTable.createdAt, fiveMinutesAgo),
          ne(ordersTable.id, orderId),
          sql`${ordersTable.status} IN ('completed', 'processing', 'on_hold')`
        ))
        .limit(1);

      if (recentOrders.length > 0) {
        logger.warn({ orderId, phone: order.phoneNumber }, `${logPrefix} Potential duplicate detected: Another order for this phone was processed in the last 5 minutes. Holding order.`);
        
        await db.update(ordersTable)
          .set({ 
            status: "on_hold",
            auditLogs: sql`${ordersTable.auditLogs} || ${JSON.stringify([{ 
              timestamp: new Date().toISOString(), 
              event: "Order put on hold: Recent order for same phone number detected (5-min guardrail)",
              relatedOrderId: recentOrders[0].id
            }])}::jsonb` as any
          })
          .where(eq(ordersTable.id, orderId));

        return { success: false, error: "Duplicate order for this phone number detected in last 5 minutes. Order is on hold for manual review." };
      }

      // 4. Record attempt start
      const requestTimestamp = new Date();
      await db.update(ordersTable)
        .set({
          fulfillmentAttemptId: attemptId,
          requestTimestamp,
          updatedAt: new Date(),
        })
        .where(eq(ordersTable.id, orderId));

      logger.info({ orderId, phone: order.phoneNumber, attemptId }, `${logPrefix} Initiating DataMart purchase request`);

      // 4. DataMart API Call
      const purchaseBody = {
        phoneNumber: order.phoneNumber,
        network: order.network,
        capacity: order.capacity,
        gateway: "wallet",
      };

      const dmRes = await datamartFetch("/purchase", {
        method: "POST",
        body: JSON.stringify(purchaseBody),
      });

      const responseTimestamp = new Date();
      const dmData = await dmRes.json() as any;
      
      // Check for DataMart's duplicate detection
      const isDuplicate = 
        dmRes.status === 409 || 
        dmData.code === "DUPLICATE_ORDER" || 
        dmData.message?.toLowerCase().includes("similar order") ||
        dmData.message?.toLowerCase().includes("already processed") ||
        dmData.message?.toLowerCase().includes("on hold");

      if (dmRes.ok || isDuplicate) {
        const orderRef = dmData.data?.orderReference || dmData.data?.existingReference || (isDuplicate ? "ALREADY_FULFILLED" : null);
        
        const isOnHold = isDuplicate && (dmData.message?.toLowerCase().includes("on hold") || dmData.code === "ON_HOLD");

        if (!orderRef && !isDuplicate) {
          logger.error({ orderId, dmData }, `${logPrefix} DataMart returned success but no order reference found`);
          throw new Error("Missing order reference in supplier response");
        }

        logger.info({ orderId, orderRef, isDuplicate, isOnHold }, `${logPrefix} Fulfillment successful${isDuplicate ? " (Duplicate detected by supplier)" : ""}`);

        return {
          success: true,
          orderReference: orderRef || undefined,
          isDuplicate: isDuplicate,
          isOnHold: isOnHold // Pass this back to PaymentService
        } as any;
      } else {
        logger.error({ orderId, dmStatus: dmRes.status, dmData }, `${logPrefix} DataMart fulfillment failed`);
        return {
          success: false,
          error: dmData.message || `Supplier error (${dmRes.status})`
        };
      }
    } catch (error) {
      logger.error({ orderId, error: (error as Error).message }, `${logPrefix} Critical error during supplier fulfillment`);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Optional: Query supplier status for a reference
   */
  static async getStatus(reference: string): Promise<any> {
    try {
      const res = await datamartFetch(`/order-status/${encodeURIComponent(reference)}`);
      if (res.ok) {
        return await res.json();
      }
      return null;
    } catch (error) {
      logger.error({ reference, error }, "Error fetching status from supplier");
      return null;
    }
  }
}
