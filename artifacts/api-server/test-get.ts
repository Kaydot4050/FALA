import { db } from "@workspace/db";
import { popupsTable, popupAnalyticsTable } from "@workspace/db/schema";
import { desc, sql } from "drizzle-orm";

async function test() {
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
    
    console.log("Success:", popups.length, "popups");
  } catch (err) {
    console.error("GET admin popups failed:", err);
  }
}

test();
