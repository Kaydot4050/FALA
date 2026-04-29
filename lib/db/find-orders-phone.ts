import { db } from "./src/index.ts";
import { sql } from "drizzle-orm";

async function findOrders() {
  const phoneNumber = "0547512261";
  
  const query = sql`
    SELECT id, phone_number, network, capacity, amount, status, paystack_reference, order_reference, created_at
    FROM orders 
    WHERE phone_number = ${phoneNumber}
    ORDER BY created_at DESC
  `;
  
  const results = await db.execute(query);

  console.log("ORDERS FOUND:", JSON.stringify(results.rows, null, 2));
  process.exit(0);
}

findOrders().catch(err => {
  console.error(err);
  process.exit(1);
});
