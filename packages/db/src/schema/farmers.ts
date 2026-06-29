import { pgTable, uuid, varchar, timestamp, text, numeric, integer, boolean, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./users";

export const farmTypeEnum = pgEnum("farm_type", ["dryland", "irrigated", "greenhouse", "orchard", "livestock", "poultry"]);

export const farmers = pgTable("farmers", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  nationalCode: varchar("national_code", { length: 10 }),
  farmType: farmTypeEnum("farm_type"),
  province: varchar("province", { length: 50 }),
  county: varchar("county", { length: 50 }),
  district: varchar("district", { length: 50 }),
  village: varchar("village", { length: 100 }),
  totalAreaHectares: numeric("total_area_hectares", { precision: 10, scale: 2 }),
  mainCrops: text("main_crops").array(),
  experienceYears: integer("experience_years"),
  certifications: text("certifications").array(),
  licenseNumber: varchar("license_number", { length: 50 }),
  bio: text("bio"),
  verifiedAt: timestamp("verified_at"),
  creditScore: integer("credit_score").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
