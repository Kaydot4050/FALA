import { db } from "./src/index.ts";
import { sql } from "drizzle-orm";

async function migrate() {
  console.log("Starting manual migration...");
  
  try {
    await db.execute(sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS fulfillment_started boolean NOT NULL DEFAULT false`);
    console.log("Added fulfillment_started");
    
    await db.execute(sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS fulfillment_attempt_id uuid UNIQUE`);
    console.log("Added fulfillment_attempt_id");
    
    await db.execute(sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS supplier_request_id text UNIQUE`);
    console.log("Added supplier_request_id");
    
    await db.execute(sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS duplicate_detection_flag boolean NOT NULL DEFAULT false`);
    console.log("Added duplicate_detection_flag");
    
    await db.execute(sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS request_timestamp timestamp`);
    console.log("Added request_timestamp");
    
    await db.execute(sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS response_timestamp timestamp`);
    console.log("Added response_timestamp");
    
    // Add unique constraint only if it doesn't exist
    // Check if constraint exists first to avoid error
    const constraintCheck = await db.execute(sql`
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_name = 'orders' AND constraint_name = 'orders_order_reference_unique'
    `);
    
    if (constraintCheck.rows.length === 0) {
      await db.execute(sql`ALTER TABLE orders ADD CONSTRAINT orders_order_reference_unique UNIQUE (order_reference)`);
      console.log("Added orders_order_reference_unique");
    } else {
      console.log("Constraint orders_order_reference_unique already exists");
    }

    console.log("Manual migration complete");
  } catch (err) {
    console.error("Migration failed:", err);
  }
  process.exit(0);
}

migrate();
