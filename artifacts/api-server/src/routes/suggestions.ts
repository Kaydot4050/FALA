import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { suggestionsTable } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";

const router: IRouter = Router();

// --- PUBLIC ROUTES ---

/**
 * POST /suggestions
 * Submits a new customer suggestion.
 */
router.post("/suggestions", async (req, res) => {
  try {
    const { name, text } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({ status: "error", message: "Suggestion text is required" });
    }

    const result = await db.insert(suggestionsTable).values({
      name: name || "Anonymous",
      text: text.trim(),
    }).returning();

    res.json({
      status: "success",
      data: result[0]
    });
  } catch (error) {
    console.error("Failed to submit suggestion:", error);
    res.status(500).json({ status: "error", message: "Failed to submit suggestion" });
  }
});

// --- ADMIN ROUTES ---

/**
 * GET /admin/suggestions
 * Returns all suggestions.
 */
router.get("/admin/suggestions", async (req, res) => {
  try {
    const suggestions = await db.select()
      .from(suggestionsTable)
      .orderBy(desc(suggestionsTable.createdAt));

    res.json({
      status: "success",
      data: suggestions
    });
  } catch (error: any) {
    console.error("Failed to fetch admin suggestions:", error);
    res.status(500).json({ 
      status: "error", 
      message: "Failed to fetch suggestions", 
      detail: error.message,
      stack: error.stack
    });
  }
});

/**
 * PATCH /admin/suggestions/:id
 * Updates suggestion status.
 */
router.patch("/admin/suggestions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await db.update(suggestionsTable)
      .set({ 
        status,
        updatedAt: new Date()
      })
      .where(eq(suggestionsTable.id, parseInt(id)))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ status: "error", message: "Suggestion not found" });
    }

    res.json({ status: "success", data: result[0] });
  } catch (error) {
    console.error("Failed to update suggestion:", error);
    res.status(500).json({ status: "error", message: "Failed to update suggestion" });
  }
});

/**
 * DELETE /admin/suggestions/:id
 * Deletes a suggestion.
 */
router.delete("/admin/suggestions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.delete(suggestionsTable)
      .where(eq(suggestionsTable.id, parseInt(id)))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ status: "error", message: "Suggestion not found" });
    }

    res.json({ status: "success", message: "Suggestion deleted successfully" });
  } catch (error) {
    console.error("Failed to delete suggestion:", error);
    res.status(500).json({ status: "error", message: "Failed to delete suggestion" });
  }
});

export default router;
