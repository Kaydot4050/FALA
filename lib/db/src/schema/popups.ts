import { pgTable, text, serial, timestamp, boolean, uuid, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import * as z from "zod";

export const popupsTable = pgTable("popups", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: text("type", { enum: ["promotional", "notice", "warning", "update", "maintenance"] }).notNull().default("notice"),
  title: text("title").notNull(),
  message: text("message").notNull(),
  buttonText: text("button_text"),
  buttonLink: text("button_link"),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").default(true).notNull(),
  priority: integer("priority").default(0).notNull(),
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  pages: jsonb("pages").$type<string[] | "all">().default("all").notNull(),
  trigger: text("trigger", { enum: ["load", "delay", "scroll", "exit"] }).default("load").notNull(),
  triggerValue: integer("trigger_value").default(0).notNull(), // seconds or scroll percentage
  frequency: text("frequency", { enum: ["once", "every_visit", "once_per_day"] }).default("every_visit").notNull(),
  settings: jsonb("settings").$type<{
    autoHide?: boolean;
    autoHideSeconds?: number;
    showCountdown?: boolean;
    countdownEnd?: string;
    darkMode?: boolean;
    richText?: boolean;
  }>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const popupAnalyticsTable = pgTable("popup_analytics", {
  id: uuid("id").primaryKey().defaultRandom(),
  popupId: uuid("popup_id").references(() => popupsTable.id, { onDelete: "cascade" }).notNull(),
  event: text("event", { enum: ["impression", "click", "dismiss"] }).notNull(),
  metadata: jsonb("metadata").$type<Record<string, any>>().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPopupSchema = createInsertSchema(popupsTable);
export type InsertPopup = typeof popupsTable.$inferInsert;
export type Popup = typeof popupsTable.$inferSelect;

export const insertPopupAnalyticsSchema = createInsertSchema(popupAnalyticsTable);
export type InsertPopupAnalytics = typeof popupAnalyticsTable.$inferInsert;
export type PopupAnalytics = typeof popupAnalyticsTable.$inferSelect;
