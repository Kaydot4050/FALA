
import pg from "pg";

const DATABASE_URL = "postgresql://neondb_owner:npg_zPdLkof4hb1G@ep-misty-fog-amez4iza-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function main() {
  const pool = new pg.Pool({ connectionString: DATABASE_URL });
  
  const orderId = "94cf0f23-1df2-4c6f-a18a-9a8696a83036";

  try {
    const orderRes = await pool.query("SELECT id, status, paystack_reference, audit_logs FROM orders WHERE id = $1", [orderId]);
    if (orderRes.rows.length === 0) {
      console.log("Order not found.");
      return;
    }

    console.log("--- Order Details ---");
    console.log(JSON.stringify(orderRes.rows[0], null, 2));

    const eventRes = await pool.query("SELECT event_type, event_data, created_at FROM order_events WHERE order_id = $1 ORDER BY created_at ASC", [orderId]);
    console.log("\n--- Order Events ---");
    console.log(JSON.stringify(eventRes.rows, null, 2));

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await pool.end();
  }
}

main();
