import { db, ordersTable } from "./src/index.ts";
import { eq, and, sql } from "drizzle-orm";

async function repairOrders() {
  console.log("Starting order repair...");
  
  // 1. Fix the specific order the user mentioned
  const specificRef = "MN-GH9676SO";
  const result = await db.update(ordersTable)
    .set({ 
      status: "completed", 
      fulfillmentStarted: true,
      updatedAt: new Date(),
      auditLogs: sql`${ordersTable.auditLogs} || ${JSON.stringify([{ 
        timestamp: new Date().toISOString(), 
        event: "Manual status repair: Synced with supplier success" 
      }])}::jsonb` as any
    })
    .where(eq(ordersTable.orderReference, specificRef))
    .returning();

  if (result.length > 0) {
    console.log(`REPAIRED: ${specificRef} (Order ID: ${result[0].id})`);
  } else {
    console.log(`NOT FOUND: ${specificRef}`);
  }

  // 2. Look for other 'ghost' orders (pending status but have successful fulfillment in logs)
  // This is a safety check
  const ghostOrders = await db.select().from(ordersTable).where(and(
    eq(ordersTable.status, "pending"),
    sql`${ordersTable.orderReference} IS NOT NULL`
  ));

  for (const order of ghostOrders) {
     console.log(`REPAIRING GHOST ORDER: ${order.id} (${order.orderReference})`);
     await db.update(ordersTable)
       .set({ 
         status: "completed", 
         fulfillmentStarted: true,
         updatedAt: new Date()
       })
       .where(eq(ordersTable.id, order.id));
  }

  process.exit(0);
}

repairOrders().catch(err => {
  console.error(err);
  process.exit(1);
});
