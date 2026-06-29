import { pgTable, uuid, varchar, text, numeric, timestamp, jsonb, pgEnum, integer } from "drizzle-orm/pg-core";
import { users } from "./users";
import { suppliers } from "./suppliers";

export const orderStatusEnum = pgEnum("order_status", [
  "pending", "confirmed", "paid", "shipped", "delivered", "cancelled", "disputed",
]);
export const paymentStatusEnum = pgEnum("payment_status", ["unpaid", "pending", "paid", "refunded"]);

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderNumber: varchar("order_number", { length: 20 }).notNull().unique(),
  buyerId: uuid("buyer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  supplierId: uuid("supplier_id").notNull().references(() => suppliers.id, { onDelete: "cascade" }),
  items: jsonb("items").notNull(),
  totalAmount: numeric("total_amount", { precision: 14, scale: 2 }).notNull(),
  status: orderStatusEnum("status").default("pending"),
  paymentStatus: paymentStatusEnum("payment_status").default("unpaid"),
  shippingAddress: jsonb("shipping_address"),
  shippingCost: numeric("shipping_cost", { precision: 14, scale: 2 }),
  notes: text("notes"),
  trackingCode: varchar("tracking_code", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const orderStatusHistory = pgTable("order_status_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  status: orderStatusEnum("status").notNull(),
  note: text("note"),
  changedBy: uuid("changed_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").references(() => orders.id, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  gateway: varchar("gateway", { length: 50 }),
  authority: varchar("authority", { length: 100 }),
  refId: varchar("ref_id", { length: 100 }),
  status: varchar("status", { length: 20 }).default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
