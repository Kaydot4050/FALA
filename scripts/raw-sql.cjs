const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function run() {
  console.log("Creating table...");
  await sql('CREATE TABLE IF NOT EXISTS sms_logs (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), direction text NOT NULL, phone_number text NOT NULL, message text NOT NULL, status text, gateway_reference text, created_at timestamp DEFAULT now() NOT NULL)');
  console.log("Done");
}

run();
