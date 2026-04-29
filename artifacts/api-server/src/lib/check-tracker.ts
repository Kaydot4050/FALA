const DATAMART_BASE_URL = "https://api.datamartgh.shop/api/developer";
const apiKey = "6914cd63913675d19ef6de56b2b35162577a4dc568f9ecf70b4830cabb8f903e";

async function fetchTracker() {
  const url = `${DATAMART_BASE_URL}/delivery-tracker`;
  const res = await fetch(url, {
    headers: {
      "X-API-Key": apiKey,
      "Content-Type": "application/json"
    }
  });
  const data = await res.json();
  console.log("TRACKER DATA:", JSON.stringify(data, null, 2));
}

fetchTracker().catch(console.error);
