import { db, ordersTable } from "./src/index.ts";
import { or, eq } from "drizzle-orm";

async function findOrders() {
  const refs = ["MN-HY6600PO", "MN-CM7312GM"];
  const results = await db.select()
    .from(ordersTable)
    .where(or(
      eq(ordersTable.orderReference, refs[0]),
      eq(ordersTable.orderReference, refs[1]),
      eq(ordersTable.paystackReference, refs[0]),
      eq(ordersTable.paystackReference, refs[1])
    ));

  console.log("ORDERS FOUND:", JSON.stringify(results, null, 2));
  process.exit(0);
}

findOrders().catch(err => {
  console.error(err);
  process.exit(1);
});
