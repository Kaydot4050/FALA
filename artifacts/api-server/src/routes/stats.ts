import { Router, type IRouter } from "express";
import { datamartFetch } from "../lib/datamart";
import { db, ordersTable } from "@workspace/db";
import { count, sum, eq, sql, inArray, gte, lte, and } from "drizzle-orm";
import { logger } from "../lib/logger";

const router: IRouter = Router();

router.get("/stats", async (req, res): Promise<void> => {
  try {
    const period = (req.query.period as string) || 'today';
    
    // Calculate Date Range in UTC to avoid timezone shifts
    const now = new Date();
    let startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    let endDate: Date | undefined = undefined;
    
    if (period === 'yesterday') {
      startDate.setUTCDate(startDate.getUTCDate() - 1);
      endDate = new Date(startDate);
      endDate.setUTCHours(23, 59, 59, 999);
    } else if (period === 'week') {
      const day = startDate.getUTCDay();
      const diff = startDate.getUTCDate() - day + (day === 0 ? -6 : 1);
      startDate.setUTCDate(diff);
    } else if (period === 'month') {
      startDate.setUTCDate(1);
    } else if (period === 'all') {
      startDate = new Date(0);
    }

    const dateFilter = endDate 
      ? and(gte(ordersTable.createdAt, startDate), lte(ordersTable.createdAt, endDate))
      : gte(ordersTable.createdAt, startDate);

    const successStatuses = ['completed', 'fulfilled', 'complete', 'success'];
    const pendingStatuses = ['pending', 'processing', 'unpaid', 'on_hold'];

    // 1. Fetch Period Orders for metrics
    const allInPeriod = await db.select({
      amount: ordersTable.amount,
      costPrice: ordersTable.costPrice,
      network: ordersTable.network,
      capacity: ordersTable.capacity,
      status: ordersTable.status,
    })
    .from(ordersTable)
    .where(dateFilter);

    // Calculate profit for period (all orders)
    const totalProfit = allInPeriod.reduce((acc, order) => {
      const price = Number(order.amount);
      let cost = order.costPrice ? Number(order.costPrice) : null;
      if (cost === null) {
        const cap = parseFloat(String(order.capacity || 1));
        cost = (order.network?.toLowerCase().includes('mtn') || order.network?.toLowerCase().includes('yello')) ? cap * 4 : price * 0.88;
      }
      const status = order.status?.toLowerCase() || '';
      const isFulfilled = status === "completed" || status === "fulfilled" || status === "success";
      return acc + (isFulfilled ? (price - cost) : 0);
    }, 0);

    const periodSuccessCount = allInPeriod.filter(o => 
      successStatuses.includes((o.status || '').toLowerCase())
    ).length;

    // 3. Fetch All Orders for global/growth stats
    const allOrders = await db.select({
      amount: ordersTable.amount,
      costPrice: ordersTable.costPrice,
      network: ordersTable.network,
      capacity: ordersTable.capacity,
      status: ordersTable.status,
      createdAt: ordersTable.createdAt
    }).from(ordersTable);

    const globalSuccess = { revenue: 0, profit: 0, count: 0 };
    const globalPending = { revenue: 0, profit: 0, count: 0 };
    const globalFailed = { revenue: 0, profit: 0, count: 0 };

    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const currentMonthStats = { revenue: 0, profit: 0, count: 0 };
    const lastMonthStats = { revenue: 0, profit: 0, count: 0 };

    let allTimeSpent = 0;
    let allTimeProfit = 0;
    let allTimeOrders = allOrders.length;
    let totalGB = 0;

    allOrders.forEach(order => {
      const status = (order.status || 'unknown').toLowerCase();
      const amount = Number(order.amount || 0);
      const orderDate = new Date(order.createdAt);
      
      const isSuccess = ['completed', 'fulfilled', 'complete', 'success'].includes(status);
      const isPending = ['pending', 'processing', 'unpaid', 'on_hold'].includes(status);
      const isFailed = ['failed', 'cancel'].includes(status);

      // Robust capacity parsing (handles "1GB", "500MB", etc.)
      const rawCap = order.capacity || "1";
      const capacity = parseFloat(rawCap.replace(/[^0-9.]/g, '')) || 1;
      
      let cost = order.costPrice ? Number(order.costPrice) : null;
      if (cost === null) {
        const isMTN = (order.network?.toLowerCase().includes('mtn') || order.network?.toLowerCase().includes('yello'));
        cost = isMTN ? capacity * 4 : amount * 0.88;
      }
      
      const profit = amount - cost;
      allTimeProfit += profit;
      
      if (isSuccess) {
        globalSuccess.revenue += amount;
        globalSuccess.profit += profit;
        globalSuccess.count += 1;
        totalGB += capacity;
      } else if (isPending) {
        globalPending.revenue += amount;
        globalPending.profit += profit;
        globalPending.count += 1;
      } else if (isFailed) {
        globalFailed.revenue += amount;
        globalFailed.profit += profit;
        globalFailed.count += 1;
      }

      allTimeSpent += amount;

      if (orderDate >= startOfCurrentMonth) {
        currentMonthStats.revenue += amount;
        currentMonthStats.count += 1;
        if (isSuccess) currentMonthStats.profit += profit;
      } else if (orderDate >= startOfLastMonth && orderDate < startOfCurrentMonth) {
        lastMonthStats.revenue += amount;
        lastMonthStats.count += 1;
        if (isSuccess) lastMonthStats.profit += profit;
      }
    });

    const calcGrowth = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const totalOrders = allInPeriod.length;
    const totalSpent = allInPeriod.reduce((acc, o) => acc + Number(o.amount || 0), 0);
    const pendingSpent = allInPeriod.reduce((acc, o) => {
      if (pendingStatuses.includes((o.status || '').toLowerCase())) {
        return acc + Number(o.amount || 0);
      }
      return acc;
    }, 0);

    const networkStats = await db.select({
      network: ordersTable.network,
      totalOrders: count(),
      totalSpent: sum(ordersTable.amount),
    })
    .from(ordersTable)
    .groupBy(ordersTable.network);

    const [customerCountResult] = await db.select({ 
      value: sql<number>`count(distinct ${ordersTable.phoneNumber})` 
    }).from(ordersTable);
    
    res.json({
      status: "success",
      data: {
        totalOrders,
        totalSpent,
        totalProfit,
        totalGB,
        totalCustomers: Number(customerCountResult?.value || 0),
        allTimeOrders,
        allTimeSpent,
        allTimeProfit,
        globalSuccess,
        globalPending,
        globalFailed,
        growth: {
          revenue: calcGrowth(currentMonthStats.revenue, lastMonthStats.revenue),
          profit: calcGrowth(currentMonthStats.profit, lastMonthStats.profit),
          orders: calcGrowth(currentMonthStats.count, lastMonthStats.count)
        },
        pendingSpent,
        successRate: totalOrders > 0 ? periodSuccessCount / totalOrders : 1.0, 
        networkBreakdown: networkStats.map((ns: any) => ({
          network: ns.network,
          totalOrders: Number(ns.totalOrders),
          totalSpent: Number(ns.totalSpent),
          totalGB: Number(ns.totalOrders) * 2
        })),
        recentActivity: []
      }
    });
  } catch (error) {
    logger.error({ error, stack: error instanceof Error ? error.stack : undefined }, "Failed to generate stats");
    res.status(500).json({ status: "error", error: "Internal server error" });
  }
});

export default router;
