import { pgTable, uuid, varchar, text, numeric, boolean, timestamp, pgEnum, integer, jsonb } from "drizzle-orm/pg-core";
import { orders } from "./orders";
import { users } from "./users";

export const carrierTypeEnum = pgEnum("carrier_type", ["self", "third_party", "platform"]);
export const shipmentStatusEnum = pgEnum("shipment_status", ["preparing", "picked_up", "in_transit", "delivered", "failed"]);

export const shipments = pgTable("shipments", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  shipmentNumber: varchar("shipment_number", { length: 20 }).notNull().unique(),
  carrierType: carrierTypeEnum("carrier_type"),
  carrierName: varchar("carrier_name", { length: 100 }),
  vehicleType: varchar("vehicle_type", { length: 50 }),
  isRefrigerated: boolean("is_refrigerated").default(false),
  originAddress: text("origin_address").notNull(),
  destinationAddress: text("destination_address").notNull(),
  originProvince: varchar("origin_province", { length: 50 }),
  destinationProvince: varchar("destination_province", { length: 50 }),
  estimatedCost: numeric("estimated_cost", { precision: 14, scale: 2 }),
  actualCost: numeric("actual_cost", { precision: 14, scale: 2 }),
  status: shipmentStatusEnum("status").default("preparing"),
  trackingCode: varchar("tracking_code", { length: 50 }),
  pickupAt: timestamp("pickup_at"),
  deliveredAt: timestamp("delivered_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const shipmentTracking = pgTable("shipment_tracking", {
  id: uuid("id").primaryKey().defaultRandom(),
  shipmentId: uuid("shipment_id").notNull().references(() => shipments.id, { onDelete: "cascade" }),
  latitude: numeric("latitude", { precision: 10, scale: 7 }),
  longitude: numeric("longitude", { precision: 10, scale: 7 }),
  status: varchar("status", { length: 50 }).notNull(),
  note: text("note"),
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
});

export const webhooks = pgTable("webhooks", {
  id: uuid("id").primaryKey().defaultRandom(),
  url: text("url").notNull(),
  events: text("events").array().notNull(),
  secret: text("secret").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const webhookDeliveries = pgTable("webhook_deliveries", {
  id: uuid("id").primaryKey().defaultRandom(),
  webhookId: uuid("webhook_id").notNull().references(() => webhooks.id, { onDelete: "cascade" }),
  event: varchar("event", { length: 50 }).notNull(),
  payload: jsonb("payload"),
  statusCode: integer("status_code"),
  response: text("response"),
  deliveredAt: timestamp("delivered_at"),
  retryCount: integer("retry_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const apiKeys = pgTable("api_keys", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  keyHash: text("key_hash").notNull(),
  scopes: text("scopes").array(),
  lastUsedAt: timestamp("last_used_at"),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
