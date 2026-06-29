import { pgTable, uuid, varchar, timestamp, text, numeric, integer, boolean, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./users";

export const companyTypeEnum = pgEnum("company_type", ["cooperative", "private", "industrial", "governmental"]);

export const companies = pgTable("companies", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  companyName: varchar("company_name", { length: 200 }).notNull(),
  nationalId: varchar("national_id", { length: 11 }),
  economicCode: varchar("economic_code", { length: 20 }),
  registrationNumber: varchar("registration_number", { length: 20 }),
  companyType: companyTypeEnum("company_type"),
  province: varchar("province", { length: 50 }),
  county: varchar("county", { length: 50 }),
  address: text("address"),
  postalCode: varchar("postal_code", { length: 10 }),
  phone: varchar("phone", { length: 11 }),
  productionLines: text("production_lines").array(),
  certifications: text("certifications").array(),
  importExportHistory: boolean("import_export_history").default(false),
  verifiedAt: timestamp("verified_at"),
  creditScore: integer("credit_score").default(0),
  logoUrl: text("logo_url"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
