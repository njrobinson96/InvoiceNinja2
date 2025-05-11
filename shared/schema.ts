import { pgTable, text, serial, integer, boolean, timestamp, numeric, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  businessName: text("business_name"),
  address: text("address"),
  phone: text("phone"),
  taxNumber: text("tax_number"),
  plan: text("plan").default("free").notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
});

// Status enum for invoices
export const invoiceStatusEnum = pgEnum("invoice_status", [
  "draft",
  "sent",
  "viewed",
  "paid",
  "overdue",
]);

// Client schema
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  address: text("address"),
  company: text("company"),
  notes: text("notes"),
});

// Invoice schema
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  clientId: integer("client_id").notNull().references(() => clients.id),
  invoiceNumber: text("invoice_number").notNull(),
  dueDate: timestamp("due_date").notNull(),
  issueDate: timestamp("issue_date").notNull(),
  status: text("status").notNull().$type<"draft" | "sent" | "viewed" | "paid" | "overdue">().default("draft"),
  totalAmount: numeric("total_amount").notNull(),
  notes: text("notes"),
  isRecurring: boolean("is_recurring").default(false),
  recurringFrequency: text("recurring_frequency"),
  lastSentDate: timestamp("last_sent_date"),
});

// Invoice items schema
export const invoiceItems = pgTable("invoice_items", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").notNull().references(() => invoices.id),
  description: text("description").notNull(),
  quantity: numeric("quantity").notNull(),
  unitPrice: numeric("unit_price").notNull(),
  amount: numeric("amount").notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  businessName: true,
  address: true,
  phone: true,
  taxNumber: true,
});

export const insertClientSchema = createInsertSchema(clients).pick({
  userId: true,
  name: true,
  email: true,
  phone: true,
  address: true,
  company: true,
  notes: true,
});

export const insertInvoiceSchema = createInsertSchema(invoices).pick({
  userId: true,
  clientId: true,
  invoiceNumber: true,
  dueDate: true,
  issueDate: true,
  status: true,
  totalAmount: true,
  notes: true,
  isRecurring: true,
  recurringFrequency: true,
});

export const insertInvoiceItemSchema = createInsertSchema(invoiceItems).pick({
  invoiceId: true,
  description: true,
  quantity: true,
  unitPrice: true,
  amount: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clients.$inferSelect;

export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;

export type InsertInvoiceItem = z.infer<typeof insertInvoiceItemSchema>;
export type InvoiceItem = typeof invoiceItems.$inferSelect;
