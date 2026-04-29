import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { popupsTable, popupAnalyticsTable } from "@workspace/db/schema";
import { eq, and, lte, gte, or, isNull, desc, sql } from "drizzle-orm";

const router: IRouter = Router();

// --- PUBLIC ROUTES (FOR FRONTEND) ---

/**
 * GET /popups/active
 * Fetches all active popups that are currently within their scheduled time.
 */
router.get("/popups/active", async (req, res) => {
  try {
    const now = new Date();
    
    const activePopups = await db.select()
      .from(popupsTable)
      .where(
        and(
          eq(popupsTable.isActive, true),
          or(isNull(popupsTable.startTime), lte(popupsTable.startTime, now)),
          or(isNull(popupsTable.endTime), gte(popupsTable.endTime, now))
        )
      )
      .orderBy(desc(popupsTable.priority));

    res.json({
      status: "success",
      data: activePopups
    });
  } catch (error) {
    console.error("Failed to fetch active popups:", error);
    res.status(500).json({ status: "error", message: "Failed to fetch active popups" });
  }
});

/**
 * POST /popups/:id/track
 * Records an impression, click, or dismiss event.
 */
router.post("/popups/:id/track", async (req, res) => {
  try {
    const { id } = req.params;
    const { event, metadata } = req.body;

    if (!["impression", "click", "dismiss"].includes(event)) {
      return res.status(400).json({ status: "error", message: "Invalid event type" });
    }

    await db.insert(popupAnalyticsTable).values({
      popupId: id,
      event,
      metadata: metadata || {}
    });

    res.json({ status: "success" });
  } catch (error) {
    console.error("Failed to track popup event:", error);
    res.status(500).json({ status: "error", message: "Failed to track event" });
  }
});

// --- ADMIN ROUTES ---

/**
 * GET /admin/popups
 * Returns all popups with analytics summary.
 */
router.get("/admin/popups", async (req, res) => {
  try {
    const popups = await db.select().from(popupsTable).orderBy(desc(popupsTable.createdAt));
    
    // Fetch analytics summary for each popup
    const stats = await db.select({
      popupId: popupAnalyticsTable.popupId,
      event: popupAnalyticsTable.event,
      count: sql<number>`count(*)`
    })
    .from(popupAnalyticsTable)
    .groupBy(popupAnalyticsTable.popupId, popupAnalyticsTable.event);

    const popupsWithStats = popups.map(p => {
      const pStats = stats.filter(s => s.popupId === p.id);
      return {
        ...p,
        analytics: {
          impressions: pStats.find(s => s.event === "impression")?.count || 0,
          clicks: pStats.find(s => s.event === "click")?.count || 0,
          dismissals: pStats.find(s => s.event === "dismiss")?.count || 0
        }
      };
    });

    res.json({ status: "success", data: popupsWithStats });
  } catch (error) {
    console.error("Failed to fetch admin popups:", error);
    res.status(500).json({ status: "error", message: "Failed to fetch popups" });
  }
});

/**
 * POST /admin/popups
 * Creates a new popup.
 */
router.post("/admin/popups", async (req, res) => {
  try {
    const popupData = req.body;
    
    const result = await db.execute(sql`
      INSERT INTO popups (
        type, title, message, button_text, button_link, image_url, is_active, priority, 
        start_time, end_time, pages, trigger, trigger_value, frequency, settings
      ) VALUES (
        ${popupData.type}, ${popupData.title}, ${popupData.message}, ${popupData.buttonText || null}, 
        ${popupData.buttonLink || null}, ${popupData.imageUrl || null}, ${popupData.isActive}, 
        ${popupData.priority || 0}, ${popupData.startTime ? new Date(popupData.startTime).toISOString() : null}, 
        ${popupData.endTime ? new Date(popupData.endTime).toISOString() : null}, ${JSON.stringify(popupData.pages || 'all')}::jsonb, 
        ${popupData.trigger || 'load'}, ${popupData.triggerValue || 0}, ${popupData.frequency || 'every_visit'}, 
        ${JSON.stringify(popupData.settings || {})}::jsonb
      )
      RETURNING *
    `);
    const newPopup = result.rows[0];

    res.json({ status: "success", data: newPopup });
  } catch (error) {
    console.error("Failed to create popup:", error);
    res.status(500).json({ status: "error", message: "Failed to create popup" });
  }
});

/**
 * PATCH /admin/popups/:id
 * Updates an existing popup.
 */
router.patch("/admin/popups/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const result = await db.execute(sql`
      UPDATE popups SET 
        type = ${updateData.type}, 
        title = ${updateData.title}, 
        message = ${updateData.message}, 
        button_text = ${updateData.buttonText || null}, 
        button_link = ${updateData.buttonLink || null}, 
        image_url = ${updateData.imageUrl || null}, 
        is_active = ${updateData.isActive}, 
        priority = ${updateData.priority || 0}, 
        start_time = ${updateData.startTime ? new Date(updateData.startTime).toISOString() : null}, 
        end_time = ${updateData.endTime ? new Date(updateData.endTime).toISOString() : null}, 
        pages = ${JSON.stringify(updateData.pages || 'all')}::jsonb, 
        trigger = ${updateData.trigger || 'load'}, 
        trigger_value = ${updateData.triggerValue || 0}, 
        frequency = ${updateData.frequency || 'every_visit'}, 
        settings = ${JSON.stringify(updateData.settings || {})}::jsonb,
        updated_at = now()
      WHERE id = ${id}
      RETURNING *
    `);
    const updatedPopup = result.rows[0];

    if (!updatedPopup) {
      return res.status(404).json({ status: "error", message: "Popup not found" });
    }

    res.json({ status: "success", data: updatedPopup });
  } catch (error) {
    console.error("Failed to update popup:", error);
    res.status(500).json({ status: "error", message: "Failed to update popup" });
  }
});

/**
 * DELETE /admin/popups/:id
 * Deletes a popup.
 */
router.delete("/admin/popups/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    // Using raw SQL to bypass Drizzle ORM prepared statement caching issues with Neon transaction poolers
    // which causes "Connection terminated unexpectedly" on delete operations.
    const result = await db.execute(sql`DELETE FROM popups WHERE id = ${id} RETURNING *`);
    const deleted = result.rows[0];

    if (!deleted) {
      return res.status(404).json({ status: "error", message: "Popup not found" });
    }

    res.json({ status: "success", message: "Popup deleted successfully" });
  } catch (error) {
    console.error("Failed to delete popup:", error);
    res.status(500).json({ status: "error", message: "Failed to delete popup" });
  }
});

export default router;
