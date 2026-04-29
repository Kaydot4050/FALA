import { pgTable, text, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const suggestionsTable = pgTable("suggestions", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }),
  text: text("text").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("New"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertSuggestionSchema = createInsertSchema(suggestionsTable).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export type Suggestion = typeof suggestionsTable.$inferSelect;
export type InsertSuggestion = z.infer<typeof insertSuggestionSchema>;
