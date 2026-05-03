import { Router } from "express";
import { db, ordersTable } from "@workspace/db";
import { count, sum, max, desc } from "drizzle-orm";
import { logger } from "../lib/logger";
import { datamartFetch } from "../lib/datamart";

const router = Router();

// GET all customers (aggregated from orders + upstream sync)
router.get("/admin/customers", async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    logger.info(`Fetching Admin Customers (Page ${page}, Limit ${limit})...`);
    
    // 1. Fetch Local Customers
    const localCustomers = await db.select({
      phoneNumber: ordersTable.phoneNumber,
      customerName: max(ordersTable.customerName),
      totalOrders: count(ordersTable.id),
      totalSpent: sum(ordersTable.amount),
      lastOrderAt: max(ordersTable.createdAt),
    })
    .from(ordersTable)
    .groupBy(ordersTable.phoneNumber)
    .orderBy(desc(max(ordersTable.createdAt)));

    const customerMap = new Map();
    localCustomers.forEach(c => {
      customerMap.set(c.phoneNumber, {
        ...c,
        totalSpent: Number(c.totalSpent || 0).toFixed(2),
        totalOrders: Number(c.totalOrders || 0)
      });
    });

    // 2. Fetch Upstream History (Last 1000 orders) for missing customers
    try {
      const upstream = await datamartFetch("/purchase-history?page=1&limit=1000");
      if (upstream.ok) {
        const upData = await upstream.json() as any;
        const upPurchases = upData.data?.purchases || [];
        
        upPurchases.forEach((p: any) => {
          const phone = p.phoneNumber;
          if (!phone) return;
          
          if (!customerMap.has(phone)) {
            customerMap.set(phone, {
              phoneNumber: phone,
              customerName: p.customerName || "Valued Customer",
              totalOrders: 1, // Minimum 1 if they are in history
              totalSpent: Number(p.price || 0).toFixed(2),
              lastOrderAt: p.createdAt || new Date().toISOString()
            });
          } else {
            // Update existing with upstream name if local is null
            const existing = customerMap.get(phone);
            if (!existing.customerName || existing.customerName === "Valued Customer") {
              existing.customerName = p.customerName;
            }
          }
        });
      }
    } catch (err) {
      logger.warn({ err }, "Failed to merge upstream customers");
    }

    const allCustomers = Array.from(customerMap.values())
      .sort((a, b) => new Date(b.lastOrderAt).getTime() - new Date(a.lastOrderAt).getTime());

    const finalCustomers = allCustomers.slice(offset, offset + limit);

    logger.info({ count: finalCustomers.length, total: allCustomers.size }, "Admin Customers Unified");

    res.json({
      status: "success",
      data: finalCustomers,
      pagination: {
        total: allCustomers.size,
        pages: Math.ceil(allCustomers.size / limit),
        currentPage: page,
        limit
      }
    });
  } catch (error) {
    logger.error({ error }, "Failed to fetch customers:");
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
});

export default router;
