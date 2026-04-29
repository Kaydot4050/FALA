const pg = require("pg");
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function test() {
  try {
    const id = "00000000-0000-0000-0000-000000000000";
    const result = await pool.query("DELETE FROM popups WHERE id = $1 RETURNING *", [id]);
    console.log("Delete successful:", result.rows);
  } catch (err) {
    console.error("Delete failed:", err);
  } finally {
    await pool.end();
  }
}

test();
