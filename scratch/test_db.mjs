import pg from 'pg';
const { Pool } = pg;

const DATABASE_URL = 'postgresql://neondb_owner:npg_zPdLkof4hb1G@ep-misty-fog-amez4iza-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
});

console.log("Attempting to connect...");

try {
  const client = await pool.connect();
  console.log("Connected successfully!");
  
  const result = await client.query('SELECT * FROM suggestions ORDER BY created_at DESC LIMIT 5');
  console.log("Query result:", JSON.stringify(result.rows, null, 2));
  console.log("Row count:", result.rowCount);
  
  client.release();
} catch (err) {
  console.error("Connection/Query error:", err.message);
  console.error("Full error:", err);
} finally {
  await pool.end();
  process.exit(0);
}
