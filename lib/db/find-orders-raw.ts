import { db } from "./src/index.ts";
import { sql } from "drizzle-orm";

async function findOrders() {
  const refs = ["MN-HY6600PO", "MN-CM7312GM"];
  
  // Use raw SQL to only select columns that definitely exist
  const query = sql`
    SELECT id, phone_number, network, capacity, amount, status, paystack_reference, order_reference, created_at
    FROM orders 
    WHERE order_reference IN (${refs[0]}, ${refs[1]}) 
       OR paystack_reference IN (${refs[0]}, ${refs[1]})
  `;
  
  const results = await db.execute(query);

  console.log("ORDERS FOUND:", JSON.stringify(results.rows, null, 2));
  process.exit(0);
}

findOrders().catch(err => {
  console.error(err);
  process.exit(1);
});
