import { pgTable, uuid, varchar, timestamp, text, numeric, integer, boolean, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./users";

export const suppliers = pgTable("suppliers", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  supplierName: varchar("supplier_name", { length: 200 }).notNull(),
  nationalId: varchar("national_id", { length: 11 }),
  province: varchar("province", { length: 50 }),
  county: varchar("county", { length: 50 }),
  address: text("address"),
  phone: varchar("phone", { length: 11 }),
  supplyCategories: text("supply_categories").array(),
  capacityUnit: varchar("capacity_unit", { length: 20 }),
  verifiedAt: timestamp("verified_at"),
  creditScore: integer("credit_score").default(0),
  rating: numeric("rating", { precision: 3, scale: 2 }).default("0"),
  logoUrl: text("logo_url"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
