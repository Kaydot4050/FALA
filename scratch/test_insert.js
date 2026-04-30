const { Client } = require('pg');

const connectionString = 'postgresql://neondb_owner:npg_zPdLkof4hb1G@ep-misty-fog-amez4iza-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function testInsert() {
  const client = new Client({
    connectionString: connectionString,
  });

  try {
    await client.connect();
    console.log('Connected to database');

    const res = await client.query(`
      INSERT INTO suggestions (name, text, status) 
      VALUES ('Test User', 'This is a test suggestion', 'New')
      RETURNING *
    `);
    
    console.log('Inserted:', res.rows[0]);

  } catch (err) {
    console.error('Insert failed:', err);
  } finally {
    await client.end();
  }
}

testInsert();
