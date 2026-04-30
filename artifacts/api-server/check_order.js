
async function main() {
  const reference = "MN-JX0311RP";
  const apiKey = "6914cd63913675d19ef6de56b2b35162577a4dc568f9ecf70b4830cabb8f903e";
  
  console.log(`Checking LIVE status for: ${reference}`);

  try {
    const res = await fetch(`https://api.datamartgh.com/api/v1/order-status/${encodeURIComponent(reference)}`, {
      headers: { "api-key": apiKey }
    });
    
    console.log(`Status: ${res.status}`);
    const text = await res.text();
    console.log("--- Response Body ---");
    console.log(text);

  } catch (error) {
    console.error("Error:", error);
  }
}

main();
