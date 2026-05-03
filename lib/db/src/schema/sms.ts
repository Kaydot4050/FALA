import { pgTable, text, timestamp, decimal, uuid, serial, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

/**
 * Tracks pre-funded balances for users who order via SMS.
 */
export const userWalletsTable = pgTable("user_wallets", {
  id: uuid("id").primaryKey().defaultRandom(),
  phoneNumber: text("phone_number").unique().notNull(),
  balance: decimal("balance", { precision: 10, scale: 2 }).default("0.00").notNull(),
  pin: text("pin"), // Optional 4-digit security PIN
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Audit trail for all inbound and outbound SMS via Arkesel/Hubtel.
 */
export const smsLogsTable = pgTable("sms_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  direction: text("direction", { enum: ["inbound", "outbound"] }).notNull(),
  phoneNumber: text("phone_number").notNull(),
  message: text("message").notNull(),
  status: text("status"), // 'delivered', 'failed', 'received'
  gatewayReference: text("gateway_reference"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Maps shorthand codes (e.g., 'MTN1GB') to internal package IDs.
 */
export const smsCommandAliasesTable = pgTable("sms_command_aliases", {
  id: serial("id").primaryKey(),
  alias: text("alias").unique().notNull(), // User-facing code
  packageId: text("package_id").notNull(), // References package_overrides.id
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserWalletSchema = createInsertSchema(userWalletsTable);
export const insertSmsLogSchema = createInsertSchema(smsLogsTable);
export const insertSmsCommandAliasSchema = createInsertSchema(smsCommandAliasesTable);

export type UserWallet = typeof userWalletsTable.$inferSelect;
export type SmsLog = typeof smsLogsTable.$inferSelect;
export type SmsCommandAlias = typeof smsCommandAliasesTable.$inferSelect;
