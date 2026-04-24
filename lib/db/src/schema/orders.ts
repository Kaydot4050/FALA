import { pgTable, text, serial, timestamp, decimal, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import * as z from "zod";

export const ordersTable = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerName: text("customer_name"),
  phoneNumber: text("phone_number").notNull(),
  network: text("network").notNull(),
  capacity: text("capacity").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  costPrice: decimal("cost_price", { precision: 10, scale: 2 }), // Price from DataMart
  status: text("status", { enum: ["pending", "paid", "fulfilled", "failed"] }).notNull().default("pending"),
  paystackReference: text("paystack_reference").unique(),
  orderReference: text("order_reference"), // DataMart reference
  source: text("source").default("web").notNull(), // 'web' or 'api'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertOrderSchema = createInsertSchema(ordersTable);
export type InsertOrder = typeof ordersTable.$inferInsert;
export type Order = typeof ordersTable.$inferSelect;
