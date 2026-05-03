const ARKESEL_KEY = process.env.ARKESEL_API_KEY;
const SENDER_ID = process.env.ARKESEL_SENDER_ID || "FalaaDeals";
const BASE_URL = "https://sms.arkesel.com/api/v2";

/**
 * Ensures phone number is in international format for Arkesel (e.g., 23359...)
 */
function formatPhone(phone: string): string {
  const clean = phone.replace(/\D/g, "");
  if (clean.startsWith("0") && clean.length === 10) {
    return "233" + clean.substring(1);
  }
  return clean;
}

export class ArkeselService {
  /**
   * Sends a plain text SMS via Arkesel V2
   */
  static async sendSMS(to: string, message: string) {
    if (!ARKESEL_KEY) {
      console.warn("ARKESEL_API_KEY is not set.");
      return { success: false, error: "API Key missing" };
    }

    const formattedTo = formatPhone(to);
    const url = `${BASE_URL}/sms/send`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "api-key": ARKESEL_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          sender: SENDER_ID,
          message: message,
          recipients: [formattedTo]
        })
      });

      const data = await response.json() as any;
      
      if (response.status === 200 && (data.status === "success" || data.code === "ok")) {
        return { success: true, data };
      } else {
        return { success: false, error: data.message || `Arkesel Error (${response.status})` };
      }
    } catch (error) {
      console.error("Arkesel V2 SMS Error:", error);
      return { success: false, error };
    }
  }
}
