import { pgTable, uuid, varchar, text, numeric, timestamp, date, pgEnum, integer } from "drizzle-orm/pg-core";
import { users } from "./users";
import { categories } from "./locations";
import { suppliers } from "./suppliers";
import { products } from "./products";

export const rfqStatusEnum = pgEnum("rfq_status", ["open", "closed", "awarded", "cancelled"]);
export const bidStatusEnum = pgEnum("bid_status", ["pending", "accepted", "rejected", "withdrawn"]);

export const rfqs = pgTable("rfqs", {
  id: uuid("id").primaryKey().defaultRandom(),
  buyerId: uuid("buyer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  categoryId: integer("category_id").references(() => categories.id),
  productName: varchar("product_name", { length: 200 }).notNull(),
  description: text("description"),
  quantity: numeric("quantity", { precision: 14, scale: 2 }).notNull(),
  unit: varchar("unit", { length: 20 }).notNull(),
  targetPrice: numeric("target_price", { precision: 14, scale: 2 }),
  deliveryProvince: varchar("delivery_province", { length: 50 }),
  deliveryCounty: varchar("delivery_county", { length: 50 }),
  deliveryDeadline: date("delivery_deadline"),
  status: rfqStatusEnum("status").default("open"),
  attachments: text("attachments").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const rfqBids = pgTable("rfq_bids", {
  id: uuid("id").primaryKey().defaultRandom(),
  rfqId: uuid("rfq_id").notNull().references(() => rfqs.id, { onDelete: "cascade" }),
  supplierId: uuid("supplier_id").notNull().references(() => suppliers.id, { onDelete: "cascade" }),
  productId: uuid("product_id").references(() => products.id),
  offeredPrice: numeric("offered_price", { precision: 14, scale: 2 }).notNull(),
  offeredQuantity: numeric("offered_quantity", { precision: 14, scale: 2 }),
  deliveryTime: varchar("delivery_time", { length: 100 }),
  notes: text("notes"),
  status: bidStatusEnum("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
