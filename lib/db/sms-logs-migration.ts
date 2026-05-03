import { neon } from "@neondatabase/serverless";

async function run() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL missing");
  
  const sql = neon(url);
  console.log("Ensuring sms_logs table...");
  
  await sql`
    CREATE TABLE IF NOT EXISTS "sms_logs" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "direction" text NOT NULL,
      "phone_number" text NOT NULL,
      "message" text NOT NULL,
      "status" text,
      "gateway_reference" text,
      "created_at" timestamp DEFAULT now() NOT NULL
    )
  `;
  
  console.log("sms_logs table verified.");
  
  const count = await sql`SELECT count(*) FROM sms_logs`;
  console.log("Current row count:", count[0].count);
}

run().catch(console.error);
