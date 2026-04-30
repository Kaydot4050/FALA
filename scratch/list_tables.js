const { Client } = require('pg');

const connectionString = 'postgresql://neondb_owner:npg_zPdLkof4hb1G@ep-misty-fog-amez4iza-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function listTables() {
  const client = new Client({
    connectionString: connectionString,
  });

  try {
    await client.connect();
    console.log('Connected to database');

    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('Tables:');
    res.rows.forEach(row => console.log(row.table_name));

  } catch (err) {
    console.error('Failed to list tables:', err);
  } finally {
    await client.end();
  }
}

listTables();
