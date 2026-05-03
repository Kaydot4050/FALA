import { Router } from "express";
import { db, smsLogsTable } from "@workspace/db";
import { desc } from "drizzle-orm";
import { logger } from "../lib/logger";

const router = Router();

/**
 * GET /api/admin/sms/logs
 * Fetches all SMS logs (inbound/outbound)
 */
router.get("/admin/sms/logs", async (req, res) => {
  try {
    const logs = await db.select()
      .from(smsLogsTable)
      .orderBy(desc(smsLogsTable.createdAt))
      .limit(100);

    return res.status(200).json({ success: true, data: logs });
  } catch (error) {
    logger.error({ error }, "Failed to fetch SMS logs");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
