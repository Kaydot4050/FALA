import { db } from "@workspace/db";
import { popupsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

async function test() {
  try {
    const popups = await db.select().from(popupsTable).limit(1);
    if (popups.length === 0) {
      console.log("No popups found to update");
      return;
    }
    const popup = popups[0];
    
    // Simulate what the route does
    const updateData = { ...popup, title: "Updated Title" };
    
    console.log("Attempting to update popup:", popup.id);
    const [updatedPopup] = await db.update(popupsTable)
      .set({
        ...updateData,
        startTime: updateData.startTime ? new Date(updateData.startTime) : undefined,
        endTime: updateData.endTime ? new Date(updateData.endTime) : undefined,
        updatedAt: new Date()
      })
      .where(eq(popupsTable.id, popup.id))
      .returning();
      
    console.log("Update successful:", updatedPopup.id);
  } catch (err) {
    console.error("Update failed:", err);
  }
}

test();
