import { db } from "../lib/db/src";
import { sql } from "drizzle-orm";

async function run() {
  console.log("Ensuring sms_logs table exists...");
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "sms_logs" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "direction" text NOT NULL,
        "phone_number" text NOT NULL,
        "message" text NOT NULL,
        "status" text,
        "gateway_reference" text,
        "created_at" timestamp DEFAULT now() NOT NULL
      )
    `);
    console.log("sms_logs table is ready.");
  } catch (error) {
    console.error("Failed to create sms_logs:", error);
  }
  process.exit(0);
}

run();
