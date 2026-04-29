import { db } from "@workspace/db";
import { popupsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

async function test() {
  try {
    const id = "00000000-0000-0000-0000-000000000000";
    await db.delete(popupsTable).where(eq(popupsTable.id, id)).returning();
    console.log("Delete successful");
  } catch (err) {
    console.error("Delete failed:", err);
  }
}

test();
