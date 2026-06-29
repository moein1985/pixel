import { pgTable, uuid, varchar, text, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./users";
import { orders } from "./orders";

export const revieweeTypeEnum = pgEnum("reviewee_type", ["supplier", "product", "farmer", "company"]);

export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  reviewerId: uuid("reviewer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  revieweeType: revieweeTypeEnum("reviewee_type"),
  revieweeId: uuid("reviewee_id").notNull(),
  orderId: uuid("order_id").references(() => orders.id, { onDelete: "set null" }),
  rating: integer("rating").notNull(),
  qualityRating: integer("quality_rating"),
  deliveryRating: integer("delivery_rating"),
  communicationRating: integer("communication_rating"),
  comment: text("comment"),
  reply: text("reply"),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const favorites = pgTable("favorites", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  itemType: varchar("item_type", { length: 20 }).notNull(),
  itemId: uuid("item_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
