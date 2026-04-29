import { db } from "./src/index.ts";
import { sql } from "drizzle-orm";

async function checkColumnType() {
  const result = await db.execute(sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'status'
  `);
  console.log("COLUMN TYPE:", result.rows);
  process.exit(0);
}

checkColumnType();
