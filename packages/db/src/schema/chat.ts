import { pgTable, uuid, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { users } from "./users";
import { products } from "./products";
import { orders } from "./orders";

export const conversations = pgTable("conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  participant1Id: uuid("participant_1_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  participant2Id: uuid("participant_2_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  relatedProductId: uuid("related_product_id").references(() => products.id, { onDelete: "set null" }),
  relatedOrderId: uuid("related_order_id").references(() => orders.id, { onDelete: "set null" }),
  lastMessageAt: timestamp("last_message_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  conversationId: uuid("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  senderId: uuid("sender_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  attachments: text("attachments").array(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
