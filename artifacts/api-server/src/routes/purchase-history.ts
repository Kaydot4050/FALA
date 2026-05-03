import { Router, type IRouter } from "express";
import { datamartFetch } from "../lib/datamart";
import { GetPurchaseHistoryQueryParams } from "@workspace/api-zod";
import { db, ordersTable } from "@workspace/db";
import { desc, sql } from "drizzle-orm";
import { logger } from "../lib/logger";

const router: IRouter = Router();

router.get("/purchase-history", async (req, res): Promise<void> => {
  try {
    const parsed = GetPurchaseHistoryQueryParams.safeParse(req.query);
    const page = parsed.success ? parsed.data.page ?? 1 : 1;
    const limit = parsed.success ? parsed.data.limit ?? 20 : 20;

    const statusFilter = parsed.success ? parsed.data.status : undefined;
    
    let whereClause: any = undefined;
    if (statusFilter && statusFilter !== 'ALL') {
      const successStatuses = ['completed', 'fulfilled', 'complete', 'success'];
      const pendingStatuses = ['pending', 'processing', 'unpaid', 'on_hold'];
      const failedStatuses = ['failed', 'cancel'];
      
      if (statusFilter === 'SUCCESS') {
        whereClause = sql`${ordersTable.status} IN (${sql.join(successStatuses.map(s => sql`${s}`), sql`, `)})`;
      } else if (statusFilter === 'PENDING') {
        whereClause = sql`${ordersTable.status} IN (${sql.join(pendingStatuses.map(s => sql`${s}`), sql`, `)})`;
      } else if (statusFilter === 'FAILED') {
        whereClause = sql`${ordersTable.status} IN (${sql.join(failedStatuses.map(s => sql`${s}`), sql`, `)})`;
      }
    }

    // 1. Fetch local orders first (This is our source of truth)
    const offset = (page - 1) * limit;
    let localOrdersQuery = db.select()
      .from(ordersTable) as any;
    
    if (whereClause) {
      localOrdersQuery = localOrdersQuery.where(whereClause);
    }

    const localOrders = await localOrdersQuery
      .orderBy(desc(ordersTable.createdAt))
      .limit(limit)
      .offset(offset);

    // 2. Map local orders
    const purchases = localOrders.map(order => ({
      id: order.id,
      customerName: order.customerName || "Valued Customer",
      phoneNumber: order.phoneNumber,
      network: order.network,
      capacity: parseFloat(order.capacity),
      price: parseFloat(order.amount.toString()),
      orderStatus: order.status,
      orderReference: order.orderReference || order.paystackReference,
      paystackReference: order.paystackReference,
      costPrice: order.costPrice,
      createdAt: order.createdAt.toISOString(),
      isLocal: true
    }));

    // 3. Fetch upstream orders (To catch anything missed)
    try {
      const upstream = await datamartFetch(`/purchase-history?page=${page}&limit=${limit}`);
      if (upstream.ok) {
        const data = await upstream.json() as any;
        const upstreamPurchases = data.data?.purchases || [];
        
        // Add upstream orders that aren't already in our local list (by reference)
        const localRefs = new Set(purchases.map(p => p.orderReference));
        upstreamPurchases.forEach((up: any) => {
          if (!localRefs.has(up.orderReference)) {
            purchases.push({
              ...up,
              customerName: up.customerName || "Valued Customer",
              isLocal: false
            });
          }
        });
      }
    } catch (err) {
      logger.warn({ err }, "Failed to fetch upstream history");
    }

    // 4. Final sort
    purchases.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    let statsQuery = db.select({ 
      count: sql<number>`count(*)`,
      totalRevenue: sql<number>`sum(${ordersTable.amount})`
    }).from(ordersTable) as any;
    
    if (whereClause) {
      statsQuery = statsQuery.where(whereClause);
    }
    
    const [statsResult] = await statsQuery;
    
    const [profitResult] = await db.select({
      totalProfit: sql<number>`sum(
        CASE 
          WHEN ${ordersTable.status} IN ('completed', 'complete', 'fulfilled', 'success') THEN
            ${ordersTable.amount} - COALESCE(${ordersTable.costPrice}, 
              CASE 
                WHEN LOWER(${ordersTable.network}) LIKE '%mtn%' OR LOWER(${ordersTable.network}) LIKE '%yello%' 
                THEN CAST(${ordersTable.capacity} AS DECIMAL) * 4
                ELSE ${ordersTable.amount} * 0.88
              END
            )
          ELSE 0 
        END
      )`,
      completedCount: sql<number>`count(CASE WHEN ${ordersTable.status} IN ('completed', 'complete', 'fulfilled', 'success') THEN 1 END)`
    })
    .from(ordersTable);

    const [pendingResult] = await db.select({
      pendingCount: sql<number>`count(*)`
    })
    .from(ordersTable)
    .where(sql`${ordersTable.status} IN ('pending', 'processing', 'unpaid')`);

    const total = Number(statsResult.count);

    res.json({
      status: "success",
      data: {
        purchases,
        globalStats: {
          totalRevenue: Number(statsResult.totalRevenue || 0),
          totalProfit: Number(profitResult[0]?.totalProfit || 0),
          totalOrders: total,
          completedCount: Number(profitResult[0]?.completedCount || 0),
          pendingCount: Number(pendingResult[0]?.pendingCount || 0)
        },
        pagination: {
          total: total,
          pages: Math.ceil(total / limit),
          currentPage: page,
          limit
        }
      }
    });

  } catch (error) {
    logger.error({ error }, "Error in purchase-history route");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
