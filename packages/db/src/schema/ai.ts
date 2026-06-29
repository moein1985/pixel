import { pgTable, uuid, varchar, text, integer, timestamp, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./users";

export const flagStatusEnum = pgEnum("flag_status", ["pending", "reviewed", "confirmed", "dismissed"]);

export const chatbotConversations = pgTable("chatbot_conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  messages: jsonb("messages"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const fraudFlags = pgTable("fraud_flags", {
  id: uuid("id").primaryKey().defaultRandom(),
  targetType: varchar("target_type", { length: 20 }).notNull(),
  targetId: uuid("target_id").notNull(),
  flagType: varchar("flag_type", { length: 50 }).notNull(),
  score: integer("score").notNull(),
  details: jsonb("details"),
  status: flagStatusEnum("status").default("pending"),
  reviewedBy: uuid("reviewed_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
