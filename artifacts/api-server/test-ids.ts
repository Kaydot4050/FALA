import { db } from "@workspace/db";
import { popupsTable } from "@workspace/db/schema";
import { desc } from "drizzle-orm";

async function test() {
  try {
    const popups = await db.select().from(popupsTable).orderBy(desc(popupsTable.createdAt));
    console.log(popups.map(p => ({ id: p.id, title: p.title })));
  } catch (err) {
    console.error(err);
  }
}
test();
