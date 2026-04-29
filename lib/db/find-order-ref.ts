import { db, ordersTable } from "./src/index.ts";
import { or, eq } from "drizzle-orm";

async function findOrder() {
  const ref = "MN-GH9676SO";
  const results = await db.select()
    .from(ordersTable)
    .where(or(
      eq(ordersTable.orderReference, ref),
      eq(ordersTable.paystackReference, ref)
    ));

  console.log("ORDER FOUND:", JSON.stringify(results, null, 2));
  process.exit(0);
}

findOrder().catch(err => {
  console.error(err);
  process.exit(1);
});
