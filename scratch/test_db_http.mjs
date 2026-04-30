// Quick DB test - uses native fetch to check the Neon database via HTTP
const DATABASE_URL = 'postgresql://neondb_owner:npg_zPdLkof4hb1G@ep-misty-fog-amez4iza-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require';

// Parse the connection string
const url = new URL(DATABASE_URL);
const host = url.hostname;
const user = url.username;
const pass = url.password;
const dbname = url.pathname.slice(1);

// Use Neon's serverless HTTP endpoint
const neonHost = host.replace('-pooler', '');
const apiUrl = `https://${neonHost}/sql`;

console.log("Testing Neon HTTP endpoint:", apiUrl);
console.log("Host:", host, "DB:", dbname);

try {
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Neon-Connection-String': DATABASE_URL,
    },
    body: JSON.stringify({
      query: 'SELECT * FROM suggestions ORDER BY created_at DESC LIMIT 5',
      params: [],
    }),
  });
  
  const data = await response.text();
  console.log("Response status:", response.status);
  console.log("Response:", data.substring(0, 500));
} catch (err) {
  console.error("Error:", err.message);
}
