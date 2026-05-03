import { Router } from "express";
import { ArkeselService } from "../services/sms-service";
import { db, smsLogsTable } from "@workspace/db";
import { logger } from "../lib/logger";

const router = Router();

/**
 * POST /api/admin/sms/send
 * Allows admins to send manual SMS to customers via Arkesel
 */
router.post("/admin/sms/send", async (req, res) => {
  const { phoneNumber, message } = req.body;

  if (!phoneNumber || !message) {
    return res.status(400).json({ error: "Phone number and message are required" });
  }

  logger.info({ phoneNumber }, "[AdminSMS] Sending manual SMS via Arkesel");

  try {
    const result = await ArkeselService.sendSMS(phoneNumber, message);

    try {
      // Log the outbound SMS
      await db.insert(smsLogsTable).values({
        direction: "outbound",
        phoneNumber: phoneNumber,
        message: message,
        status: result.success ? "sent" : "failed",
        gatewayReference: result.data?.id || null
      });
    } catch (dbError) {
      logger.error({ dbError }, "Failed to log SMS to database, but sending proceeded");
    }

    if (result.success) {
      return res.status(200).json({ success: true, message: "SMS sent successfully" });
    } else {
      return res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    logger.error({ error }, "Admin SMS sending failed");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
