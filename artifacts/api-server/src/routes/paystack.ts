import { Router, type IRouter } from "express";
import { createHmac } from "crypto";
import { datamartFetch } from "../lib/datamart";
import { logger } from "../lib/logger";
import { db, ordersTable } from "@workspace/db";
import { eq, and, ne } from "drizzle-orm";

const router: IRouter = Router();

/**
 * POST /paystack/initialize
 * Creates a pending order in the DB, then initializes a Paystack transaction.
 * Returns the Paystack authorization_url for the frontend to redirect to.
 */
router.post("/paystack/initialize", async (req, res): Promise<void> => {
  const { phoneNumber, network, capacity, amount, customerName, recipientName, source } = req.body;
  const finalName = customerName || recipientName || "Valued Customer";
  const finalSource = source || "web";
  
  console.log("DEBUG: Received customerName:", finalName, "Source:", finalSource);
  logger.info({ body: req.body, customerName: finalName, source: finalSource }, "Paystack initialize request");

  if (!phoneNumber || !network || !capacity || !amount) {
    res.status(400).json({ error: "Missing required fields: phoneNumber, network, capacity, amount" });
    return;
  }

  const secretKey = process.env["PAYSTACK_SECRET_KEY"];
  if (!secretKey || secretKey === "PLACEHOLDER_REPLACE_ME") {
    res.status(500).json({ error: "Paystack is not configured. Please set PAYSTACK_SECRET_KEY." });
    return;
  }

  try {
    // 1a. Fetch cost price from DataMart
    let datamartCostPrice: string | null = null;
    try {
      // Map frontend network names to DataMart API internal names
      const netMap: Record<string, string> = {
        "MTN": "YELLO",
        "TELECEL": "TELECEL",
        "AT": "at",
        "AIRTELTIGO": "at"
      };
      const dmNet = netMap[network.toUpperCase()] || network;

      const dmRes = await datamartFetch(`/data-packages`);
      if (dmRes.ok) {
        const dmData = await dmRes.json() as any;
        if (dmData.status === "success" && dmData.data?.[dmNet]) {
          const pkg = dmData.data[dmNet].find((p: any) => String(p.capacity) === String(capacity));
          if (pkg) {
             datamartCostPrice = String(pkg.price);
             logger.info({ network, dmNet, capacity, cost: datamartCostPrice }, "Found cost price from DataMart");
          }
        }
      }
    } catch (e) {
      logger.warn({ error: e, network, capacity }, "Failed to fetch cost price from DataMart, proceeding without it");
    }

    // 1b. Create pending order in database
    const [order] = await db.insert(ordersTable).values({
      customerName: finalName,
      phoneNumber,
      network,
      capacity: String(capacity),
      amount: String(amount),
      costPrice: datamartCostPrice,
      status: "pending",
      source: finalSource,
    }).returning();

    // 2. Initialize Paystack transaction
    const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: Math.round(Number(amount) * 100), // Paystack uses kobo/pesewas (amount * 100)
        email: `customer-${phoneNumber}@falaa.deals`,
        currency: "GHS",
        reference: order.id, // Use our order ID as the reference
        callback_url: `${req.headers.origin || "http://localhost:3005"}/payment/callback`,
        metadata: {
          phoneNumber,
          network,
          capacity: String(capacity),
          orderId: order.id,
        },
      }),
    });

    const paystackData = await paystackRes.json() as any;

    if (!paystackData.status) {
      logger.error({ paystackData }, "Paystack initialization failed");
      res.status(400).json({ error: paystackData.message || "Failed to initialize payment" });
      return;
    }

    // 3. Update order with Paystack reference
    await db.update(ordersTable)
      .set({ paystackReference: paystackData.data.reference })
      .where(eq(ordersTable.id, order.id));

    logger.info({ orderId: order.id, reference: paystackData.data.reference }, "Paystack transaction initialized");

    res.json({
      status: "success",
      data: {
        authorizationUrl: paystackData.data.authorization_url,
        reference: paystackData.data.reference,
        orderId: order.id,
      },
    });
  } catch (error) {
    logger.error({ error }, "Error initializing Paystack transaction");
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Shared function to handle order fulfillment via DataMart.
 * Can be triggered by Webhook OR by manual Verification fallback.
 */
async function handleFulfillment(orderId: string) {
  try {
    // 1. Find the order
    const [order] = await db.select()
      .from(ordersTable)
      .where(eq(ordersTable.id, orderId))
      .limit(1);

    if (!order) {
      logger.warn({ orderId }, "Order not found for fulfillment");
      return;
    }

    if (order.status === "fulfilled" || order.status === "processing") {
      logger.info({ orderId, status: order.status }, "Order already being processed or fulfilled, skipping to prevent double purchase");
      return;
    }

    // 2. Atomically mark as 'processing' to lock out other requests
    await db.update(ordersTable)
      .set({ status: "processing", updatedAt: new Date() })
      .where(and(
        eq(ordersTable.id, orderId),
        ne(ordersTable.status, "fulfilled"),
        ne(ordersTable.status, "processing")
      ));

    // 2. Fulfill the order via DataMart
    const purchaseBody = {
      phoneNumber: order.phoneNumber,
      network: order.network,
      capacity: order.capacity,
      gateway: "wallet",
    };

    const upstream = await datamartFetch("/purchase", {
      method: "POST",
      body: JSON.stringify(purchaseBody),
    });

    const purchaseData = await upstream.json() as any;

    if (upstream.status === 201 && purchaseData.data?.orderReference) {
      // 3. Mark as fulfilled
      await db.update(ordersTable)
        .set({
          status: "fulfilled",
          orderReference: purchaseData.data.orderReference,
          updatedAt: new Date(),
        })
        .where(eq(ordersTable.id, order.id));

      logger.info({
        orderId: order.id,
        datamartRef: purchaseData.data.orderReference,
        phone: order.phoneNumber,
      }, "Order fulfilled successfully via DataMart");
    } else {
      // 4. Mark as failed
      await db.update(ordersTable)
        .set({ status: "failed", updatedAt: new Date() })
        .where(eq(ordersTable.id, order.id));

      logger.error({
        orderId: order.id,
        datamartStatus: upstream.status,
        datamartResponse: purchaseData,
      }, "DataMart fulfillment failed");
    }
  } catch (error) {
    logger.error({ error, orderId }, "Error processing order fulfillment");
  }
}

/**
 * POST /paystack/webhook
 * Receives payment notifications from Paystack.
 * On successful payment, triggers the DataMart purchase to fulfill the order.
 */
router.post("/paystack/webhook", async (req, res): Promise<void> => {
  const secretKey = process.env["PAYSTACK_SECRET_KEY"];
  if (!secretKey) {
    res.status(500).json({ error: "Paystack not configured" });
    return;
  }

  // Verify Paystack signature
  const signature = req.headers["x-paystack-signature"] as string;
  const hash = createHmac("sha512", secretKey)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (hash !== signature) {
    logger.warn({ 
      receivedSig: signature?.substring(0, 8), 
      calculatedSig: hash.substring(0, 8),
      bodyLength: JSON.stringify(req.body).length
    }, "Paystack webhook signature mismatch - check your Secret Key in Netlify");
    // We respond 200 anyway to prevent Paystack from retrying indefinitely if it's a config issue
    res.status(200).json({ error: "Signature mismatch" });
    return;
  }

  const event = req.body;
  logger.info({ event: event.event, reference: event.data?.reference }, "Paystack webhook received");

  if (event.event === "charge.success") {
    const reference = event.data.reference;

    // 1. Fetch order from DB
    const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, reference)).limit(1);

    if (order) {
      if (order.status === "pending" || order.status === "unpaid") {
        logger.info({ reference, orderId: order.id }, "Webhook: Payment confirmed. Updating local status to 'paid'");
        
        try {
          await db.update(ordersTable)
            .set({ status: "paid", updatedAt: new Date() })
            .where(eq(ordersTable.id, reference));
          
          logger.info({ reference }, "Webhook: Status updated to 'paid'. Triggering fulfillment...");
          await handleFulfillment(reference);
        } catch (dbErr) {
          logger.error({ dbErr, reference }, "Webhook: Failed to update order status in database. This might be a connection issue.");
          // We don't return here because Paystack might retry, or we might want to try fulfillment anyway if possible
        }
      } else {
        logger.info({ reference, currentStatus: order.status }, "Webhook: Order already processed or fulfilled. Ignoring to prevent double delivery.");
      }
    } else {
      logger.error({ reference, event: event.event }, "Webhook CRITICAL: Received success for a transaction reference that does not exist in our database!");
    }
  }

  // Always respond 200 to Paystack
  res.sendStatus(200);
});

/**
 * GET /paystack/verify/:reference
 * Verify payment status (used by frontend callback page)
 * Now includes a fallback to Paystack API if local status is pending.
 */
router.get("/paystack/verify/:reference", async (req, res): Promise<void> => {
  const reference = Array.isArray(req.params.reference) ? req.params.reference[0] : req.params.reference;
  if (!reference) {
    res.status(400).json({ error: "Missing reference" });
    return;
  }

  const secretKey = process.env["PAYSTACK_SECRET_KEY"];

  try {
    // 1. Check local DB first
    let [order] = await db.select()
      .from(ordersTable)
      .where(eq(ordersTable.id, reference))
      .limit(1);

    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    // 2. If status is still 'pending', pull status from Paystack API
    if (order.status === "pending" && secretKey) {
      logger.info({ reference }, "Local status pending, polling Paystack API for verification");
      
      const paystackRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
        headers: { "Authorization": `Bearer ${secretKey}` }
      });
      
      const paystackData = await paystackRes.json() as any;
      
      if (paystackData.status && paystackData.data.status === "success") {
        logger.info({ reference }, "Paystack API confirmed success, updating local status and triggering fulfillment");
        
        // Update local status to paid
        await db.update(ordersTable)
          .set({ status: "paid", updatedAt: new Date() })
          .where(eq(ordersTable.id, reference));
        
        // Trigger fulfillment
        await handleFulfillment(reference);

        // Refetch order to get updated status for response
        [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, reference)).limit(1);
      } else {
        logger.debug({ reference, paystackStatus: paystackData.data?.status }, "Paystack API verify check: not successful yet");
      }
    }

    res.json({
      status: "success",
      data: {
        orderId: order.id,
        orderStatus: order.status,
        orderReference: order.orderReference,
        phoneNumber: order.phoneNumber,
        network: order.network,
        capacity: order.capacity,
        amount: order.amount,
      },
    });
  } catch (error) {
    logger.error({ error, reference }, "Error verifying payment");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
