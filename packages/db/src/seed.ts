import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
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
    { phone: "09100000002", role: "farmer" as const, firstName: "علی", lastName: "محمدی", status: "active" as const },
    { phone: "09100000003", role: "supplier" as const, firstName: "رضا", lastName: "احمدی", status: "active" as const },
    { phone: "09100000004", role: "company" as const, firstName: "مریم", lastName: "کریمی", status: "active" as const },
    { phone: "09100000005", role: "moderator" as const, firstName: "ناظر", lastName: "تستی", status: "active" as const },
    { phone: "09100000006", role: "farmer" as const, firstName: "حسن", lastName: "علوی", status: "active" as const },
    { phone: "09100000007", role: "farmer" as const, firstName: "فاطمه", lastName: "حسینی", status: "active" as const },
    { phone: "09100000008", role: "farmer" as const, firstName: "محمد", lastName: "رضایی", status: "active" as const },
    { phone: "09100000009", role: "farmer" as const, firstName: "زهرا", lastName: "موسوی", status: "active" as const },
    { phone: "09100000010", role: "farmer" as const, firstName: "حسین", lastName: "نجفی", status: "active" as const },
    { phone: "09100000011", role: "farmer" as const, firstName: "سارا", lastName: "صادقی", status: "active" as const },
    { phone: "09100000012", role: "supplier" as const, firstName: "مهدی", lastName: "باقری", status: "active" as const },
    { phone: "09100000013", role: "supplier" as const, firstName: "نگین", lastName: "شریفی", status: "active" as const },
    { phone: "09100000014", role: "supplier" as const, firstName: "امیر", lastName: "طاهری", status: "active" as const },
    { phone: "09100000015", role: "company" as const, firstName: "الهام", lastName: "مرادی", status: "active" as const },
    { phone: "09100000016", role: "company" as const, firstName: "بابک", lastName: "فردوسی", status: "active" as const },
  ];

  for (const u of testUsers) {
    await db.insert(schema.users).values(u).onConflictDoNothing();
  }

  // ─── Test Farmer Profiles ───────────────────────────────
  console.log("  → Farmer profiles...");
  const farmerData = [
    { phone: "09100000002", farmType: "irrigated" as const, province: "خراسان رضوی", county: "مشهد", village: "اکلمه", mainCrops: ["گندم", "جو"], totalAreaHectares: "50", experienceYears: 15, bio: "کشاورز با ۱۵ سال سابقه در کشت گندم و جو", creditScore: 75, verifiedAt: new Date() },
    { phone: "09100000006", farmType: "dryland" as const, province: "فارس", county: "شیراز", village: "سعادت‌شهر", mainCrops: ["گندم", "جو", "عدس"], totalAreaHectares: "120", experienceYears: 20, bio: "کشاورزی دیمی با تمرکز بر غلات و حبوبات", creditScore: 80, verifiedAt: new Date() },
    { phone: "09100000007", farmType: "orchard" as const, province: "اصفهان", county: "سمیرم", village: "ده‌بید", mainCrops: ["سیب", "گردو"], totalAreaHectares: "15", experienceYears: 10, bio: "باغدار سیب و گردو", creditScore: 65 },
    { phone: "09100000008", farmType: "greenhouse" as const, province: "تهران", county: "ورامین", mainCrops: ["گوجه", "خیار"], totalAreaHectares: "3", experienceYears: 8, bio: "صاحب گلخانه گوجه و خیار", creditScore: 70, verifiedAt: new Date() },
    { phone: "09100000009", farmType: "livestock" as const, province: "آذربایجان شرقی", county: "تبریز", village: "باسمنج", mainCrops: ["یونجه", "ذرت علوفه‌ای"], totalAreaHectares: "40", experienceYears: 12, bio: "دامدار و تولیدکننده علوفه", creditScore: 60 },
    { phone: "09100000010", farmType: "irrigated" as const, province: "خوزستان", county: "اهواز", village: "میانکوه", mainCrops: ["نیشکر", "برنج"], totalAreaHectares: "80", experienceYears: 18, bio: "کشاورز نیشکر و برنج در خوزستان", creditScore: 85, verifiedAt: new Date() },
    { phone: "09100000011", farmType: "poultry" as const, province: "گیلان", county: "رشت", mainCrops: ["مرغ گوشتی"], totalAreaHectares: "2", experienceYears: 5, bio: "طیوردار با ظرفیت تولید بالا", creditScore: 55 },
  ];

  for (const fd of farmerData) {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.phone, fd.phone)).limit(1);
    if (user) {
      const { phone, ...profileData } = fd;
      await db.insert(schema.farmers).values({ userId: user.id, ...profileData }).onConflictDoNothing();
    }
  }

  // ─── Test Supplier Profiles ─────────────────────────────
  console.log("  → Supplier profiles...");
  const supplierData = [
    { phone: "09100000003", supplierName: "تأمین‌کننده نهاده آریا", province: "تهران", county: "تهران", supplyCategories: ["کود", "بذر"], capacityUnit: "تن", description: "تأمین‌کننده کود و بذر با ۱۰ سال سابقه", creditScore: 78, rating: "4.5", verifiedAt: new Date() },
    { phone: "09100000012", supplierName: "پخش کشاورزی سپهر", province: "اصفهان", county: "اصفهان", supplyCategories: ["سموم", "کود"], capacityUnit: "کیلوگرم", description: "عرضه‌کننده سموم و کود شیمیایی", creditScore: 65, rating: "3.8" },
    { phone: "09100000013", supplierName: "تجهیزات کشاورزی پارس", province: "تهران", county: "ورامین", supplyCategories: ["ماشین‌آلات"], capacityUnit: "عدد", description: "تأمین‌کننده تراکتور و کمباین", creditScore: 72, rating: "4.2", verifiedAt: new Date() },
    { phone: "09100000014", supplierName: "نهاده‌های زنده ایران", province: "فارس", county: "شیراز", supplyCategories: ["بذر", "نهال"], capacityUnit: "کیلوگرم", description: "بذر و نهال اصلاح‌شده", creditScore: 68, rating: "4.0" },
  ];

  for (const sd of supplierData) {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.phone, sd.phone)).limit(1);
    if (user) {
      const { phone, ...profileData } = sd;
      await db.insert(schema.suppliers).values({ userId: user.id, ...profileData }).onConflictDoNothing();
    }
  }

  // ─── Test Company Profiles ──────────────────────────────
  console.log("  → Company profiles...");
  const companyData = [
    { phone: "09100000004", companyName: "تعاونی کشاورزان نمونه", companyType: "cooperative" as const, province: "اصفهان", county: "اصفهان", productionLines: ["فرآوری غلات"], description: "تعاونی روستایی فعال در فرآوری غلات", creditScore: 82, verifiedAt: new Date() },
    { phone: "09100000015", companyName: "صنایع غذایی پارسیان", companyType: "private" as const, province: "تهران", county: "تهران", productionLines: ["آرد", "روغن"], description: "شرکت خصوصی فعال در صنایع غذایی", creditScore: 75, verifiedAt: new Date() },
    { phone: "09100000016", companyName: "تعاونی فرآوری میوه دنا", companyType: "cooperative" as const, province: "کهگیلویه و بویراحمد", county: "کهگیلویه", productionLines: ["کنسانتره میوه", "رب انار"], description: "فرآوری میوه‌های گرمسیری", creditScore: 60 },
  ];

  for (const cd of companyData) {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.phone, cd.phone)).limit(1);
    if (user) {
      const { phone, ...profileData } = cd;
      await db.insert(schema.companies).values({ userId: user.id, ...profileData }).onConflictDoNothing();
    }
  }

  // ─── Test Documents ───────────────────────────────────────
  console.log("  → Documents...");
  const documents = [
    { title: "قانون حمایت از کشاورزان", category: "law", source: "مجلس شورای اسلامی", summary: "قانون حمایت از تولیدکنندگان کشاورزی و فرآورده‌های آنان" },
    { title: "دستورالعمل استفاده از سموم کشاورزی", category: "guideline", source: "وزارت جهاد کشاورزی", summary: "راهنمای مصرف صحیح سموم برای جلوگیری از آسیب زیست‌محیطی" },
    { title: "آیین‌نامه صادرات محصولات کشاورزی", category: "regulation", source: "سازمان غذا و دارو", summary: "مقررات و شرایط صادرات فرآورده‌های کشاورزی" },
    { title: "راهنمای کشت پاییزه", category: "manual", source: "مرکز تحقیقات کشاورزی", summary: "راهنمای کشت غلات پاییزه برای کشاورزان" },
    { title: "استاندارد ارگانیک در ایران", category: "guideline", source: "سازمان استاندارد", summary: "معیارها و شاخص‌های تولید ارگانیک" },
  ];

  for (const doc of documents) {
    await db.insert(schema.documents).values(doc).onConflictDoNothing();
  }

  console.log("✅ Seed complete!");
  console.log(`   Dev OTP code: ${OTP_CONFIG.DEV_MODE_CODE}`);
  console.log("   Test users: 09100000001 (admin) ~ 09100000016");
  await client.end();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
