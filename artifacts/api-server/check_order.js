
import pg from "pg";

const DATABASE_URL = "postgresql://neondb_owner:npg_zPdLkof4hb1G@ep-misty-fog-amez4iza-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function main() {
  const pool = new pg.Pool({ connectionString: DATABASE_URL });
  
  try {
    const res = await pool.query("SELECT id, phone_number, status, audit_logs, created_at FROM orders ORDER BY created_at DESC LIMIT 5");
    console.log(JSON.stringify(res.rows, null, 2));

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await pool.end();
  }
}

main();
