# فاز ۱ — هسته اصلی و شناسنامه کشاورزی (MVP)

## هدف

پیاده‌سازی احراز هویت، پروفایل‌های کاربری (کشاورز، تأمین‌کننده، شرکت/تعاونی)، پورتال اطلاع‌رسانی پایه، و ساختار دیتابیس مرکزی. در پایان این فاز یک MVP قابل استفاده با کاربران واقعی آماده است.

## مدت تخمینی: ۳-۴ هفته

---

## مرحله ۱: طراحی Schema دیتابیس

### ۱-۱. جدول‌های اصلی

**`packages/db/src/schema/users.ts`:**

```typescript
// users — جدول پایه کاربران
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  phone: varchar("phone", { length: 11 }).notNull().unique(), // 09xxxxxxxxx
  nationalCode: varchar("national_code", { length: 10 }),     // کد ملی
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  role: userRole("role").notNull().default("farmer"),          // admin | farmer | supplier | company | moderator
  status: userStatus("status").notNull().default("pending"),   // pending | active | suspended | rejected
  avatarUrl: text("avatar_url"),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// otp_codes — کدهای یکبارمصرف پیامکی
export const otpCodes = pgTable("otp_codes", {
  id: uuid("id").primaryKey().defaultRandom(),
  phone: varchar("phone", { length: 11 }).notNull(),
  code: varchar("code", { length: 6 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false).notNull(),
  attempts: integer("attempts").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// sessions — نشست‌های کاربر
export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

**`packages/db/src/schema/farmers.ts`:**

```typescript
// farmers — پروفایل کشاورز (حقیقی)
export const farmers = pgTable("farmers", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull().unique(),
  nationalCode: varchar("national_code", { length: 10 }),
  farmType: farmType("farm_type"), // dryland | irrigated | greenhouse | orchard | livestock | poultry
  province: varchar("province", { length: 50 }),        // استان
  county: varchar("county", { length: 50 }),            // شهرستان
  district: varchar("district", { length: 50 }),        // بخش
  village: varchar("village", { length: 100 }),          // روستا
  totalAreaHectares: numeric("total_area_hectares", { precision: 10, scale: 2 }),
  mainCrops: text("main_crops").array(),                 // ["گندم", "جو", "پنبه"]
  experienceYears: integer("experience_years"),
  certifications: text("certifications").array(),        // ["GAP", "ارگانیک"]
  licenseNumber: varchar("license_number", { length: 50 }), // جواز کسب جهاد کشاورزی
  bio: text("bio"),
  verifiedAt: timestamp("verified_at"),                  // تأیید توسط ناظر/ادمین
  creditScore: integer("credit_score").default(0),       // امتیاز اعتباری 0-100
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

**`packages/db/src/schema/companies.ts`:**

```typescript
// companies — پروفایل شرکت/تعاونی/صنعت فرآوری (حقوقی)
export const companies = pgTable("companies", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull().unique(),
  companyName: varchar("company_name", { length: 200 }).notNull(),
  nationalId: varchar("national_id", { length: 11 }),    // شناسه ملی
  economicCode: varchar("economic_code", { length: 20 }), // کد اقتصادی
  registrationNumber: varchar("registration_number", { length: 20 }),
  companyType: companyType("company_type"), // cooperative | private | industrial | governmental
  province: varchar("province", { length: 50 }),
  county: varchar("county", { length: 50 }),
  address: text("address"),
  postalCode: varchar("postal_code", { length: 10 }),
  phone: varchar("phone", { length: 11 }),
  productionLines: text("production_lines").array(),     // خطوط تولید/فرآوری
  certifications: text("certifications").array(),         // گواهی‌ها و استانداردها
  importExportHistory: boolean("import_export_history").default(false),
  verifiedAt: timestamp("verified_at"),
  creditScore: integer("credit_score").default(0),
  logoUrl: text("logo_url"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

**`packages/db/src/schema/suppliers.ts`:**

```typescript
// suppliers — پروفایل تأمین‌کننده نهاده
export const suppliers = pgTable("suppliers", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull().unique(),
  supplierName: varchar("supplier_name", { length: 200 }).notNull(),
  nationalId: varchar("national_id", { length: 11 }),
  province: varchar("province", { length: 50 }),
  county: varchar("county", { length: 50 }),
  address: text("address"),
  phone: varchar("phone", { length: 11 }),
  supplyCategories: text("supply_categories").array(),   // ["بذر", "کود", "سم", "ماشین‌آلات"]
  capacityUnit: varchar("capacity_unit", { length: 20 }), // تن، کیلوگرم، عدد
  verifiedAt: timestamp("verified_at"),
  creditScore: integer("credit_score").default(0),
  rating: numeric("rating", { precision: 3, scale: 2 }).default("0"), // 0-5
  logoUrl: text("logo_url"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

**`packages/db/src/schema/locations.ts`:**

```typescript
// provinces — استان‌های ایران
export const provinces = pgTable("provinces", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
});

// counties — شهرستان‌ها
export const counties = pgTable("counties", {
  id: serial("id").primaryKey(),
  provinceId: integer("province_id").references(() => provinces.id).notNull(),
  name: varchar("name", { length: 50 }).notNull(),
});

// categories — دسته‌بندی محصولات و نهاده‌های کشاورزی
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  parentId: integer("parent_id").references(() => categories.id), // دسته‌بندی درختی
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  type: categoryType("type"), // product | input | equipment | service
  icon: varchar("icon", { length: 50 }),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
});
```

### ۱-۲. Enumها (در packages/shared)

```typescript
// packages/shared/src/enums.ts

export const userRole = z.enum(["admin", "farmer", "supplier", "company", "moderator"]);
export type UserRole = z.infer<typeof userRole>;

export const userStatus = z.enum(["pending", "active", "suspended", "rejected"]);
export type UserStatus = z.infer<typeof userStatus>;

export const farmType = z.enum(["dryland", "irrigated", "greenhouse", "orchard", "livestock", "poultry"]);
export type FarmType = z.infer<typeof farmType>;

export const companyType = z.enum(["cooperative", "private", "industrial", "governmental"]);
export type CompanyType = z.infer<typeof companyType>;

export const categoryType = z.enum(["product", "input", "equipment", "service"]);
export type CategoryType = z.infer<typeof categoryType>;
```

### ۱-۳. Indexهای جستجوی فارسی

```sql
-- بعد از ایجاد جدول‌ها، این indexها اجرا می‌شوند:
CREATE INDEX idx_farmers_name_trgm ON farmers USING gin (firstName gin_trgm_ops);
CREATE INDEX idx_companies_name_trgm ON companies USING gin (companyName gin_trgm_ops);
CREATE INDEX idx_suppliers_name_trgm ON suppliers USING gin (supplierName gin_trgm_ops);

-- index برای جستجوی بدون نیم‌فاصله:
CREATE INDEX idx_farmers_name_unaccent ON farmers USING gin (unaccent(firstName) gin_trgm_ops);
CREATE INDEX idx_companies_name_unaccent ON companies USING gin (unaccent(companyName) gin_trgm_ops);
```

---

## مرحله ۲: احراز هویت (OTP پیامکی)

### ۲-۱. جریان احراز هویت

```
کاربر شماره موبایل وارد می‌کند
         │
    ┌────▼────┐
    │ ارسال OTP│ ──→ کد ۶ رقمی پیامک می‌شود (اعتبار ۲ دقیقه)
    └────┬────┘
         │
    کاربر کد را وارد می‌کند
         │
    ┌────▼─────┐
    │ تأیید OTP │ ──→ درست؟
    └────┬─────┘
         │
    ┌────┴────────────────┐
    │ بله                  │ خیر
    │                      │
    ▼                      ▼
کاربر موجود؟         پیام خطا + افزایش attempts
    │
    ┌────┴────┐
    │ بله      │ خیر
    │          │
    ▼          ▼
ورود + token   ثبت‌نام → انتخاب نقش → تکمیل پروفایل
```

### ۲-۲. tRPC Router احراز هویت

**`apps/api/src/trpc/routers/auth.ts`** — endpointهای مورد نیاز:

| Endpoint | ورودی | خروجی | توضیح |
|---|---|---|---|
| `auth.requestOtp` | `{ phone: string }` | `{ success: boolean }` | ارسال کد پیامکی |
| `auth.verifyOtp` | `{ phone, code }` | `{ token, user?, needsRegistration? }` | تأیید کد و ورود/ثبت‌نام |
| `auth.register` | `{ phone, role, firstName, lastName, nationalCode }` | `{ token, user }` | ثبت‌نام کاربر جدید |
| `auth.me` | (token) | `{ user, profile? }` | دریافت اطلاعات کاربر فعلی |
| `auth.logout` | (token) | `{ success }` | خروج |
| `auth.refresh` | (token) | `{ token }` | تمدید نشست |

### ۲-۳. منطق OTP

- کد: ۶ رقم تصادفی
- اعتبار: ۲ دقیقه
- حداکثر تلاش: ۳ بار
- محدودیت ارسال: حداکثر ۱ پیامک در دقیقه برای هر شماره
- ذخیره در Redis با TTL (به‌جای دیتابیس برای سرعت بیشتر)
- در محیط توسعه: کد ثابت `123456` و عدم ارسال پیامک واقعی

### ۲-۴. سرویس پیامک

**`apps/api/src/lib/sms.ts`** — رابط عمومی برای ارسال پیامک:

- پشتیبانی از کاوه‌نگار / فراز SMS / ملی-پیامک
- متغیر محیطی `SMS_PROVIDER` برای انتخاب
- متد `sendOtp(phone, code)` و `sendNotification(phone, message)`
- در محیط توسعه: لاگ در کنسول به‌جای ارسال واقعی

---

## مرحله ۳: پروفایل‌های کاربری

### ۳-۱. tRPC Routerهای پروفایل

**`apps/api/src/trpc/routers/farmer.ts`:**

| Endpoint | ورودی | خروجی | دسترسی |
|---|---|---|---|
| `farmer.getMyProfile` | — | `FarmerProfile` | farmer |
| `farmer.updateMyProfile` | `Partial<FarmerProfile>` | `FarmerProfile` | farmer |
| `farmer.getProfile` | `{ farmerId }` | `PublicFarmerProfile` | public |
| `farmer.list` | `{ province?, farmType?, crop?, page }` | `{ items, total }` | public |
| `farmer.search` | `{ query, page }` | `{ items, total }` | public |

**`apps/api/src/trpc/routers/company.ts`:**

| Endpoint | ورودی | خروجی | دسترسی |
|---|---|---|---|
| `company.getMyProfile` | — | `CompanyProfile` | company |
| `company.updateMyProfile` | `Partial<CompanyProfile>` | `CompanyProfile` | company |
| `company.getProfile` | `{ companyId }` | `PublicCompanyProfile` | public |
| `company.list` | `{ province?, type?, page }` | `{ items, total }` | public |
| `company.search` | `{ query, page }` | `{ items, total }` | public |

**`apps/api/src/trpc/routers/supplier.ts`:**

| Endpoint | ورودی | خروجی | دسترسی |
|---|---|---|---|
| `supplier.getMyProfile` | — | `SupplierProfile` | supplier |
| `supplier.updateMyProfile` | `Partial<SupplierProfile>` | `SupplierProfile` | supplier |
| `supplier.getProfile` | `{ supplierId }` | `PublicSupplierProfile` | public |
| `supplier.list` | `{ province?, category?, page }` | `{ items, total }` | public |
| `supplier.search` | `{ query, page }` | `{ items, total }` | public |

### ۳-۲. صفحات فرانت‌اند پروفایل

**صفحات مورد نیاز در `apps/web/src/app/`:**

```
/                           # صفحه اصلی پورتال
/login                      # ورود با OTP
/register                   # انتخاب نقش و ثبت‌نام
/profile/                   # داشبورد شخصی (redirect بر اساس نقش)
/profile/edit               # ویرایش پروفایل
/farmers                    # لیست کشاورزان (public)
/farmers/[id]               # پروفایل عمومی کشاورز
/suppliers                  # لیست تأمین‌کنندگان (public)
/suppliers/[id]             # پروفایل عمومی تأمین‌کننده
/companies                  # لیست شرکت‌ها (public)
/companies/[id]             # پروفایل عمومی شرکت
/admin                      # پنل مدیریت
/admin/users                # مدیریت کاربران
/admin/farmers              # مدیریت کشاورزان
/admin/suppliers            # مدیریت تأمین‌کنندگان
/admin/companies            # مدیریت شرکت‌ها
```

### ۳-۳. کامپوننت‌های UI مشترک

- `ProfileCard` — کارت پروفایل خلاصه (تصویر، نام، نقش، استان، امتیاز)
- `ProfileDetail` — نمایش کامل پروفایل
- `ProfileEditForm` — فرم ویرایش با React Hook Form + Zod
- `RoleSelector` — انتخاب نقش هنگام ثبت‌نام
- `LocationSelector` — انتخاب استان/شهرستان (cascading dropdown)
- `CategorySelector` — انتخاب دسته‌بندی محصولات
- `CreditBadge` — نمایش امتیاز اعتباری با رنگ‌بندی
- `VerificationBadge` — نمایش وضعیت تأیید (تأییدشده/در انتظار)

---

## مرحله ۴: پورتال اطلاع‌رسانی پایه

### ۴-۱. صفحه اصلی پورتال

- Hero section با معرفی پروژه پیکسل
- آمار کلی (تعداد کشاورزان، تأمین‌کنندگان، محصولات)
- دسته‌بندی‌های اصلی کشاورزی (کارت‌های قابل کلیک)
- جستجوی سریع (نام محصول، نام کشاورز/تأمین‌کننده، استان)
- اخبار و اطلاعیه‌های اخیر (در فاز ۳ کامل می‌شود، فعلاً placeholder)
- لینک به صفحات لیست (کشاورزان، تأمین‌کنندگان، شرکت‌ها)

### ۴-۲. جستجوی پیشرفته

- فیلتر بر اساس: نوع فعالیت، کالا/محصول، استان، شهرستان، رتبه اعتباری
- جستجوی متن آزاد با pg_trgm (تحمل غلط املایی)
- جستجوی بدون نیم‌فاصله (unaccent)
- مرتب‌سازی بر اساس: امتیاز اعتباری، جدیدترین، نام
- pagination با cursor

### ۴-۳. بانک قوانین و دستورالعمل‌ها (ساختار پایه)

**`packages/db/src/schema/documents.ts`:**

```typescript
export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 200 }).notNull(),
  category: varchar("category", { length: 50 }), // law | regulation | guideline | manual
  source: varchar("source", { length: 100 }),     // مرجع منتشرکننده
  fileUrl: text("file_url"),                       // فایل PDF در MinIO
  summary: text("summary"),
  publishDate: timestamp("publish_date"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

صفحات:
- `/documents` — لیست قوانین و دستورالعمل‌ها با فیلتر
- `/documents/[id]` — نمایش جزئیات + دانلود فایل

---

## مرحله ۵: پنل مدیریت (Admin)

### ۵-۱. قابلیت‌های پنل مدیریت

- **مدیریت کاربران**: لیست، جستجو، فیلتر، تعلیق/فعال‌سازی، تغییر نقش
- **تأیید پروفایل‌ها**: بررسی و تأیید/رد پروفایل کشاورزان، تأمین‌کنندگان، شرکت‌ها
- **مدیریت دسته‌بندی‌ها**: افزودن/ویرایش/حذف دسته‌بندی محصولات
- **مدیریت مناطق**: افزودن/ویرایش استان‌ها و شهرستان‌ها
- **مدیریت اسناد**: افزودن/ویرایش قوانین و دستورالعمل‌ها
- **آمار کلی**: تعداد کاربران به تفکیک نقش، تعداد پروفایل‌های تأییدشده/در انتظار

### ۵-۲. tRPC Router مدیریت

**`apps/api/src/trpc/routers/admin.ts`:**

| Endpoint | ورودی | خروجی | دسترسی |
|---|---|---|---|
| `admin.getStats` | — | `DashboardStats` | admin |
| `admin.listUsers` | `{ role?, status?, page }` | `{ items, total }` | admin |
| `admin.updateUserStatus` | `{ userId, status }` | `{ success }` | admin |
| `admin.verifyProfile` | `{ profileType, profileId, verified }` | `{ success }` | admin, moderator |
| `admin.listCategories` | — | `Category[]` | admin |
| `admin.createCategory` | `{ name, parentId, type }` | `Category` | admin |
| `admin.updateCategory` | `{ id, name, isActive }` | `Category` | admin |
| `admin.listDocuments` | `{ page }` | `{ items, total }` | admin |
| `admin.createDocument` | `{ title, category, fileUrl, ... }` | `Document` | admin |

---

## مرحله ۶: آپلود فایل و تصویر

### ۶-۱. سرویس MinIO

**`apps/api/src/lib/minio.ts`:**

- متد `uploadFile(bucket, file, path)` — آپلود فایل
- متد `getSignedUrl(path, expiry)` — تولید URL موقت
- متد `deleteFile(bucket, path)` — حذف فایل
- متد `uploadImage(file, maxWidth, quality)` — آپلود + فشرده‌سازی تصویر

### ۶-۲. tRPC endpointهای آپلود

| Endpoint | ورودی | خروجی | توضیح |
|---|---|---|---|
| `upload.avatar` | `FormData (file)` | `{ url }` | آپلود تصویر پروفایل |
| `upload.logo` | `FormData (file)` | `{ url }` | آپلود لوگو شرکت/تأمین‌کننده |
| `upload.document` | `FormData (file)` | `{ url }` | آپلود سند/مجوز |
| `upload.image` | `FormData (file, type)` | `{ url }` | آپلود تصویر عمومی |

---

## مرحله ۷: Seed Data

**`packages/db/src/seed.ts`:**

داده‌های اولیه برای تست و راه‌اندازی:

- **۳۱ استان** ایران
- **~۴۵۰ شهرستان** (حداقل استان‌های اصلی)
- **دسته‌بندی‌های کشاورزی**:
  - بذر و نهال (زیردسته‌ها: غلات، حبوبات، صیفی‌جات، درختان،...)
  - کود (شیمیایی، ارگانیک، بیولوژیک)
  - سموم کشاورزی (حشره‌کش، قارچ‌کش، علف‌کش)
  - ماشین‌آلات کشاورزی (تراکتور، کمباین، آبیاری،...)
  - دام و طیور (خوراک دام، دام زنده،...)
  - گلخانه‌ای (ساختار گلخانه، تجهیزات،...)
  - فرآوری محصولات (غلات، میوه، سبزی، لبنیات،...)
  - خدمات کشاورزی (آبیاری، کشت، برداشت، مشاوره)
- **۵ کاربر تستی**: admin, farmer, supplier, company, moderator
- **۱۰ پروفایل کشاورز نمونه**
- **۵ پروفایل تأمین‌کننده نمونه**
- **۳ پروفایل شرکت نمونه**
- **۵ سند/قانون نمونه**

---

## مرحله ۸: تست‌های فاز ۱

### ۸-۱. تست‌های خودکار (Vitest)

**تست‌های API (apps/api/tests/):**

```
auth.test.ts          — تست جریان کامل OTP (ارسال، تأیید، ثبت‌نام، ورود، خروج)
farmer.test.ts        — CRUD پروفایل کشاورز + جستجو + فیلتر
company.test.ts       — CRUD پروفایل شرکت + جستگو + فیلتر
supplier.test.ts      — CRUD پروفایل تأمین‌کننده + جستجو + فیلتر
admin.test.ts         — تست دسترسی‌های admin + تأیید پروفایل + آمار
upload.test.ts        — تست آپلود فایل به MinIO
search.test.ts        — تست جستجوی فارسی با pg_trgm (بدون نیم‌فاصله)
```

سناریوهای کلیدی تست:
- ارسال OTP → تأیید با کد اشتباه (۳ بار) → قفل موقت
- ارسال OTP → تأیید با کد درست → ثبت‌نام → ورود
- کاربر farmer نمی‌تواند endpointهای supplier را صدا بزند (role guard)
- جستجوی «گندم» و «گند م» نتیجه یکسان بدهند (unaccent + trgm)
- admin می‌تواند پروفایل را تأیید/رد کند
- آپلود تصویر بزرگ → فشرده‌سازی → ذخیره در MinIO

**تست‌های E2E (Playwright):**

```
e2e/auth.spec.ts          — جریان کامل ورود در مرورگر
e2e/registration.spec.ts  — ثبت‌نام نقش‌های مختلف
e2e/profile.spec.ts       — ویرایش پروفایل
e2e/search.spec.ts        — جستجو در لیست کشاورزان/تأمین‌کنندگان
e2e/admin.spec.ts         — پنل مدیریت و تأیید پروفایل
```

### ۸-۲. تست میدانی

پس از استقرار روی سرور:

- **۳-۵ کشاورز واقعی** ثبت‌نام کنند و پروفایل بسازند
- **۲-۳ تأمین‌کننده** ثبت‌نام کنند و پروفایل بسازند
- **۱-۲ شرکت/تعاونی** ثبت‌نام کنند
- جمع‌آوری بازخورد:
  - آیا جریان OTP روان است؟
  - آیا فرم ثبت‌نام واضح است؟
  - آیا انتخاب استان/شهرستان درست کار می‌کند؟
  - آیا نمایش پروفایل رضایت‌بخش است؟
- رفع اشکالات قبل از ورود به فاز ۲

### ۸-۳. چک‌لیست تأیید فاز ۱

- [ ] احراز هویت OTP پیامکی کار می‌کند (تست با شماره واقعی)
- [ ] ثبت‌نام با ۴ نقش (farmer, supplier, company, moderator) کار می‌کند
- [ ] پروفایل کشاورز با تمام فیلدها قابل ایجاد و ویرایش است
- [ ] پروفایل شرکت با تمام فیلدها قابل ایجاد و ویرایش است
- [ ] پروفایل تأمین‌کننده با تمام فیلدها قابل ایجاد و ویرایش است
- [ ] جستجوی فارسی با pg_trgm کار می‌کند (بدون نیم‌فاصله)
- [ ] فیلتر بر اساس استان، نوع، دسته‌بندی کار می‌کند
- [ ] پنل مدیریت کار می‌کند (تأیید پروفایل، مدیریت کاربران)
- [ ] آپلود تصویر و فایل به MinIO کار می‌کند
- [ ] صفحه اصلی پورتال نمایش داده می‌شود
- [ ] تمام unit testها و E2E testها pass می‌شوند
- [ ] تست میدانی با کاربران واقعی انجام شده و بازخوردها رفع شده‌اند

---

## خروجی نهایی فاز ۱ (MVP)

- کاربران می‌توانند با شماره موبایل ثبت‌نام کنند
- ۴ نقش کاربری با پروفایل‌های اختصاصی فعال است
- پورتال اطلاع‌رسانی با جستجوی پیشرفته فعال است
- پنل مدیریت برای تأیید پروفایل‌ها و مدیریت سیستم فعال است
- آپلود فایل و تصویر کار می‌کند
- داده‌های اولیه (استان‌ها، دسته‌بندی‌ها، کاربران نمونه) بارگذاری شده
- تست میدانی با کاربران واقعی انجام شده
