import { db, ordersTable } from "./src/index.ts";
import { sql } from "drizzle-orm";

async function checkDuplicates() {
  const duplicates = await db.select({
    orderReference: ordersTable.orderReference,
    count: sql`count(*)`
  })
  .from(ordersTable)
  .groupBy(ordersTable.orderReference)
  .having(sql`count(*) > 1`);

  console.log("DUPLICATES FOUND:", duplicates);
  process.exit(0);
}

checkDuplicates().catch(err => {
  console.error(err);
  process.exit(1);
});
