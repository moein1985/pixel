import { pgTable, serial, varchar, integer, text, timestamp, boolean, uuid, pgEnum } from "drizzle-orm/pg-core";

export const categoryTypeEnum = pgEnum("category_type", ["product", "input", "equipment", "service"]);

export const provinces = pgTable("provinces", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
});

export const counties = pgTable("counties", {
  id: serial("id").primaryKey(),
  provinceId: integer("province_id").notNull().references(() => provinces.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 50 }).notNull(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  parentId: integer("parent_id"),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  type: categoryTypeEnum("type"),
  icon: varchar("icon", { length: 50 }),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
});

export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 200 }).notNull(),
  category: varchar("category", { length: 50 }),
  source: varchar("source", { length: 100 }),
  fileUrl: text("file_url"),
  summary: text("summary"),
  publishDate: timestamp("publish_date"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
