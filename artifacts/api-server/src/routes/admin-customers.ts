import { Router } from "express";
import { db, ordersTable } from "@workspace/db";
import { count, sum, max, eq, desc, and, or, sql } from "drizzle-orm";
import { logger } from "../lib/logger";

const router = Router();

// GET all customers (aggregated from orders)
router.get("/admin/customers", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    logger.info("Fetching Admin Customers for today...");
    const customers = await db.select({
      phoneNumber: ordersTable.phoneNumber,
      customerName: max(ordersTable.customerName),
      totalOrders: count(ordersTable.id),
      totalSpent: sum(ordersTable.amount),
      lastOrderAt: max(ordersTable.createdAt),
    })
    .from(ordersTable)
    .where(and(
      eq(ordersTable.status, "fulfilled"),
      sql`${ordersTable.createdAt} >= ${today}`
    ))
    .groupBy(ordersTable.phoneNumber)
    .orderBy(desc(max(ordersTable.createdAt)));

    logger.info({ count: customers.length }, "Admin Customers Fetched");

    res.json({
      status: "success",
      data: customers.map(c => ({
        ...c,
        totalSpent: Number(c.totalSpent || 0).toFixed(2),
        totalOrders: Number(c.totalOrders || 0)
      }))
    });
  } catch (error) {
    logger.error({ error }, "Failed to fetch customers:");
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
});

export default router;
