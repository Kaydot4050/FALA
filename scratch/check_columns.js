const { Client } = require('pg');

const connectionString = 'postgresql://neondb_owner:npg_zPdLkof4hb1G@ep-misty-fog-amez4iza-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function checkColumns() {
  const client = new Client({
    connectionString: connectionString,
  });

  try {
    await client.connect();
    console.log('Connected to database');

    const res = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'suggestions'
    `);
    
    console.log('Columns in suggestions:');
    res.rows.forEach(row => console.log(`${row.column_name}: ${row.data_type}`));

  } catch (err) {
    console.error('Failed to check columns:', err);
  } finally {
    await client.end();
  }
}

checkColumns();
