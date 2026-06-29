import { pgTable, uuid, varchar, text, numeric, integer, boolean, timestamp, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { suppliers } from "./suppliers";
import { categories } from "./locations";

export const stockStatusEnum = pgEnum("stock_status", ["in_stock", "low_stock", "out_of_stock"]);

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  supplierId: uuid("supplier_id").notNull().references(() => suppliers.id, { onDelete: "cascade" }),
  categoryId: integer("category_id").references(() => categories.id),
  name: varchar("name", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 240 }).notNull().unique(),
  description: text("description"),
  unit: varchar("unit", { length: 20 }).notNull(),
  pricePerUnit: numeric("price_per_unit", { precision: 14, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("IRR"),
  minOrderQuantity: numeric("min_order_quantity", { precision: 14, scale: 2 }),
  availableQuantity: numeric("available_quantity", { precision: 14, scale: 2 }),
  stockStatus: stockStatusEnum("stock_status").default("in_stock"),
  images: text("images").array(),
  specifications: jsonb("specifications"),
  origin: varchar("origin", { length: 100 }),
  brand: varchar("brand", { length: 100 }),
  certifications: text("certifications").array(),
  isActive: boolean("is_active").default(true),
  isVerified: boolean("is_verified").default(false),
  viewCount: integer("view_count").default(0),
  rating: numeric("rating", { precision: 3, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const productPriceHistory = pgTable("product_price_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  price: numeric("price", { precision: 14, scale: 2 }).notNull(),
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
});
