import { pgTable, uuid, varchar, text, timestamp, integer, boolean, serial, jsonb, date, numeric, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./users";
import { categories } from "./locations";

export const articleCategoryEnum = pgEnum("article_category", ["news", "article", "report", "guideline", "announcement"]);
export const articleStatusEnum = pgEnum("article_status", ["draft", "published", "archived"]);

export const articles = pgTable("articles", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 250 }).notNull(),
  slug: varchar("slug", { length: 300 }).notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  coverImageUrl: text("cover_image_url"),
  category: articleCategoryEnum("category"),
  tags: text("tags").array(),
  authorId: uuid("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: articleStatusEnum("status").default("draft"),
  publishedAt: timestamp("published_at"),
  viewCount: integer("view_count").default(0),
  isFeatured: boolean("is_featured").default(false),
  attachments: text("attachments").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const articleCategories = pgTable("article_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  parentId: integer("parent_id"),
  description: text("description"),
  sortOrder: integer("sort_order").default(0),
});

export const reportTypeEnum = pgEnum("report_type", ["price_analysis", "supply_demand", "seasonal", "export_import", "general"]);

export const marketReports = pgTable("market_reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 250 }).notNull(),
  slug: varchar("slug", { length: 300 }).notNull().unique(),
  summary: text("summary").notNull(),
  content: text("content").notNull(),
  reportType: reportTypeEnum("report_type"),
  relatedCategoryIds: integer("related_category_ids").array(),
  relatedProductIds: uuid("related_product_ids").array(),
  dataCharts: jsonb("data_charts"),
  coverImageUrl: text("cover_image_url"),
  authorId: uuid("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: articleStatusEnum("status").default("draft"),
  publishedAt: timestamp("published_at"),
  viewCount: integer("view_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const marketPrices = pgTable("market_prices", {
  id: uuid("id").primaryKey().defaultRandom(),
  productName: varchar("product_name", { length: 200 }).notNull(),
  categoryId: integer("category_id").references(() => categories.id),
  province: varchar("province", { length: 50 }),
  county: varchar("county", { length: 50 }),
  minPrice: numeric("min_price", { precision: 14, scale: 2 }).notNull(),
  maxPrice: numeric("max_price", { precision: 14, scale: 2 }).notNull(),
  avgPrice: numeric("avg_price", { precision: 14, scale: 2 }).notNull(),
  unit: varchar("unit", { length: 20 }).notNull(),
  source: varchar("source", { length: 100 }),
  recordedAt: date("recorded_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
