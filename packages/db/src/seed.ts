import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { PROVINCES, PRODUCT_CATEGORIES, OTP_CONFIG } from "@pixel/shared";

const connectionString = process.env.DATABASE_URL ?? "postgresql://pixel:pixel@localhost:5432/pixel";

async function seed() {
  const client = postgres(connectionString, { prepare: false });
  const db = drizzle(client, { schema });

  console.log("🌱 Seeding database...");

  // ─── Provinces ───────────────────────────────────────────
  console.log("  → Provinces...");
  for (const name of PROVINCES) {
    await db.insert(schema.provinces).values({ name }).onConflictDoNothing();
  }

  // ─── Categories ──────────────────────────────────────────
  console.log("  → Categories...");
  for (const cat of PRODUCT_CATEGORIES) {
    const [parent] = await db
      .insert(schema.categories)
      .values({
        name: cat.name,
        slug: cat.slug,
        type: cat.type,
        sortOrder: 0,
      })
      .onConflictDoNothing()
      .returning();

    if (parent && "children" in cat && cat.children) {
      for (let i = 0; i < cat.children.length; i++) {
        const child = cat.children[i];
        await db
          .insert(schema.categories)
          .values({
            name: child.name,
            slug: child.slug,
            parentId: parent.id,
            sortOrder: i,
          })
          .onConflictDoNothing();
      }
    }
  }

  // ─── Test Users ──────────────────────────────────────────
  console.log("  → Test users...");
  const testUsers = [
    { phone: "09100000001", role: "admin" as const, firstName: "ادمین", lastName: "سیستم", status: "active" as const },
    { phone: "09100000002", role: "farmer" as const, firstName: "کشاورز", lastName: "تستی", status: "active" as const },
    { phone: "09100000003", role: "supplier" as const, firstName: "تأمین‌کننده", lastName: "تستی", status: "active" as const },
    { phone: "09100000004", role: "company" as const, firstName: "شرکت", lastName: "تستی", status: "active" as const },
    { phone: "09100000005", role: "moderator" as const, firstName: "ناظر", lastName: "تستی", status: "active" as const },
  ];

  for (const u of testUsers) {
    await db.insert(schema.users).values(u).onConflictDoNothing();
  }

  // ─── Test Farmer Profile ─────────────────────────────────
  const [farmerUser] = await db
    .select()
    .from(schema.users)
    .where(postgres`phone = '09100000002'`);

  if (farmerUser) {
    await db.insert(schema.farmers).values({
      userId: farmerUser.id,
      farmType: "irrigated",
      province: "خراسان رضوی",
      county: "مشهد",
      mainCrops: ["گندم", "جو"],
      totalAreaHectares: "50",
      experienceYears: 15,
      bio: "کشاورز با ۱۵ سال سابقه در کشت گندم و جو",
    }).onConflictDoNothing();
  }

  // ─── Test Supplier Profile ───────────────────────────────
  const [supplierUser] = await db
    .select()
    .from(schema.users)
    .where(postgres`phone = '09100000003'`);

  if (supplierUser) {
    await db.insert(schema.suppliers).values({
      userId: supplierUser.id,
      supplierName: "تأمین‌کننده نهاده آریا",
      province: "تهران",
      county: "تهران",
      supplyCategories: ["کود", "بذر"],
      capacityUnit: "تن",
      description: "تأمین‌کننده کود و بذر با ۱۰ سال سابقه",
    }).onConflictDoNothing();
  }

  // ─── Test Company Profile ────────────────────────────────
  const [companyUser] = await db
    .select()
    .from(schema.users)
    .where(postgres`phone = '09100000004'`);

  if (companyUser) {
    await db.insert(schema.companies).values({
      userId: companyUser.id,
      companyName: "تعاونی کشاورزان نمونه",
      companyType: "cooperative",
      province: "اصفهان",
      county: "اصفهان",
      productionLines: ["فرآوری غلات"],
      description: "تعاونی روستایی فعال در فرآوری غلات",
    }).onConflictDoNothing();
  }

  console.log("✅ Seed complete!");
  console.log(`   Dev OTP code: ${OTP_CONFIG.DEV_MODE_CODE}`);
  await client.end();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
