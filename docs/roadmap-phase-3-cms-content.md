# فاز ۳ — مدیریت محتوا، اخبار و گزارشات

## هدف

پیاده‌سازی CMS کامل برای اخبار و مقالات کشاورزی، گزارش بازار، سیستم تبلیغات بنری، شبکه ارتباطی کشاورزان، و رتبه‌بندی پیشرفته فعالان.

## مدت تخمینی: ۲-۳ هفته

---

## مرحله ۱: Schema محتوا

### ۱-۱. جدول مقالات و اخبار

**`packages/db/src/schema/content.ts`:**

```typescript
// articles — مقالات و اخبار
export const articles = pgTable("articles", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 250 }).notNull(),
  slug: varchar("slug", { length: 300 }).notNull().unique(),
  excerpt: text("excerpt"),                  // خلاصه
  content: text("content").notNull(),         // محتوای کامل (Markdown یا HTML)
  coverImageUrl: text("cover_image_url"),
  category: articleCategory("category"),      // news | article | report | guideline | announcement
  tags: text("tags").array(),
  authorId: uuid("author_id").references(() => users.id).notNull(),
  status: articleStatus("status").default("draft"), // draft | published | archived
  publishedAt: timestamp("published_at"),
  viewCount: integer("view_count").default(0),
  isFeatured: boolean("is_featured").default(false),
  attachments: text("attachments").array(),   // فایل‌های پیوست
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// article_categories — دسته‌بندی مقالات
export const articleCategories = pgTable("article_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  parentId: integer("parent_id").references(() => articleCategories.id),
  description: text("description"),
  sortOrder: integer("sort_order").default(0),
});
```

### ۱-۲. جدول گزارش بازار

```typescript
// market_reports — گزارش‌های تحلیل بازار کشاورزی
export const marketReports = pgTable("market_reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 250 }).notNull(),
  slug: varchar("slug", { length: 300 }).notNull().unique(),
  summary: text("summary").notNull(),
  content: text("content").notNull(),
  reportType: reportType("report_type"), // price_analysis | supply_demand | seasonal | export_import | general
  relatedCategoryIds: integer("related_category_ids").array(), // دسته‌بندی‌های مرتبط
  relatedProductIds: uuid("related_product_ids").array(),
  dataCharts: jsonb("data_charts"),           // داده‌های نمودار برای نمایش
  coverImageUrl: text("cover_image_url"),
  authorId: uuid("author_id").references(() => users.id).notNull(),
  status: articleStatus("status").default("draft"),
  publishedAt: timestamp("published_at"),
  viewCount: integer("view_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// market_prices — قیمت‌های روزانه بازار (داده خام برای گزارش‌ها)
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
  source: varchar("source", { length: 100 }),     // منبع داده
  recordedAt: date("recorded_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

### ۱-۳. جدول تبلیغات

```typescript
// advertisements — تبلیغات بنری و محتوایی
export const advertisements = pgTable("advertisements", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 200 }).notNull(),
  type: adType("type"),               // banner | sidebar | inline | popup
  placement: adPlacement("placement"), // home_top | home_sidebar | market_top | article_inline | all_pages
  imageUrl: text("image_url"),
  targetUrl: text("target_url").notNull(),     // لینک مقصد
  advertiserId: uuid("advertiser_id").references(() => users.id),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  impressions: integer("impressions").default(0),
  clicks: integer("clicks").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

### ۱-۴. جدول شبکه ارتباطی

```typescript
// farmer_networks — شبکه‌های ارتباطی کشاورزان
export const farmerNetworks = pgTable("farmer_networks", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  networkType: networkType("network_type"), // regional | crop_based | cooperative | general
  province: varchar("province", { length: 50 }),
  categoryId: integer("category_id").references(() => categories.id), // دسته‌بندی محصول مرتبط
  creatorId: uuid("creator_id").references(() => users.id).notNull(),
  memberCount: integer("member_count").default(0),
  isPrivate: boolean("is_private").default(false),
  coverImageUrl: text("cover_image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// network_members — اعضای شبکه
export const networkMembers = pgTable("network_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  networkId: uuid("network_id").references(() => farmerNetworks.id).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  role: networkMemberRole("role").default("member"), // admin | moderator | member
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

// network_posts — پست‌های شبکه
export const networkPosts = pgTable("network_posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  networkId: uuid("network_id").references(() => farmerNetworks.id).notNull(),
  authorId: uuid("author_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  images: text("images").array(),
  likeCount: integer("like_count").default(0),
  commentCount: integer("comment_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// network_comments — نظرات روی پست‌ها
export const networkComments = pgTable("network_comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  postId: uuid("post_id").references(() => networkPosts.id).notNull(),
  authorId: uuid("author_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  parentId: uuid("parent_id").references(() => networkComments.id), // پاسخ به نظر
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

### ۱-۵. جدول فرم‌های همکاری

```typescript
// inquiries — فرم‌های درخواست همکاری و استعلام
export const inquiries = pgTable("inquiries", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: inquiryType("type"), // cooperation | inquiry | complaint | suggestion
  name: varchar("name", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 11 }).notNull(),
  email: varchar("email", { length: 100 }),
  subject: varchar("subject", { length: 200 }).notNull(),
  message: text("message").notNull(),
  attachments: text("attachments").array(),
  status: inquiryStatus("status").default("new"), // new | reviewed | responded | closed
  assignedTo: uuid("assigned_to").references(() => users.id),
  response: text("response"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

### ۱-۶. Enumهای جدید

```typescript
export const articleCategory = z.enum(["news", "article", "report", "guideline", "announcement"]);
export const articleStatus = z.enum(["draft", "published", "archived"]);
export const reportType = z.enum(["price_analysis", "supply_demand", "seasonal", "export_import", "general"]);
export const adType = z.enum(["banner", "sidebar", "inline", "popup"]);
export const adPlacement = z.enum(["home_top", "home_sidebar", "market_top", "article_inline", "all_pages"]);
export const networkType = z.enum(["regional", "crop_based", "cooperative", "general"]);
export const networkMemberRole = z.enum(["admin", "moderator", "member"]);
export const inquiryType = z.enum(["cooperation", "inquiry", "complaint", "suggestion"]);
export const inquiryStatus = z.enum(["new", "reviewed", "responded", "closed"]);
```

---

## مرحله ۲: CMS مقالات و اخبار

### ۲-۱. tRPC Router محتوا

**`apps/api/src/trpc/routers/content.ts`:**

| Endpoint | ورودی | خروجی | دسترسی |
|---|---|---|---|
| `article.create` | `{ title, content, category, ... }` | `Article` | admin, moderator |
| `article.update` | `{ id, ...fields }` | `Article` | admin, moderator |
| `article.delete` | `{ id }` | `{ success }` | admin |
| `article.publish` | `{ id }` | `Article` | admin, moderator |
| `article.archive` | `{ id }` | `Article` | admin, moderator |
| `article.get` | `{ id or slug }` | `Article` | public |
| `article.list` | `{ category?, tag?, status?, page }` | `{ items, total }` | public (published) / admin (all) |
| `article.search` | `{ query, page }` | `{ items, total }` | public |
| `article.getFeatured` | — | `Article[]` | public |
| `article.incrementViews` | `{ id }` | `{ success }` | public |

### ۲-۲. ویرایشگر محتوا

- استفاده از **Tiptap** (rich text editor) در فرانت‌اند
- پشتیبانی از: متن فارسی RTL، تصاویر، جداول، لیست‌ها، لینک‌ها
- آپلود تصویر درون ویرایشگر (به MinIO)
- پیش‌نمایش قبل از انتشار
- ذخیره خودکار draft

### ۲-۳. صفحات مقالات

```
/news                         # لیست اخبار و مقالات
/news/category/[slug]         # مقالات یک دسته‌بندی
/news/[slug]                  # صفحه مقاله
/news/search                  # جستجوی مقالات
/admin/content/articles       # مدیریت مقالات (admin)
/admin/content/articles/new   # ایجاد مقاله
/admin/content/articles/[id]  # ویرایش مقاله
```

---

## مرحله ۳: گزارش بازار

### ۳-۱. tRPC Router گزارش بازار

| Endpoint | ورودی | خروجی | دسترسی |
|---|---|---|---|
| `marketReport.create` | `{ title, reportType, content, ... }` | `MarketReport` | admin, moderator |
| `marketReport.update` | `{ id, ...fields }` | `MarketReport` | admin, moderator |
| `marketReport.get` | `{ id or slug }` | `MarketReport` | public |
| `marketReport.list` | `{ type?, page }` | `{ items, total }` | public |
| `marketPrice.add` | `{ productName, prices, ... }` | `MarketPrice` | admin, moderator |
| `marketPrice.batchAdd` | `MarketPrice[]` | `{ count }` | admin (import) |
| `marketPrice.list` | `{ productName?, province?, from?, to? }` | `MarketPrice[]` | public |
| `marketPrice.getLatest` | `{ productName?, province? }` | `MarketPrice[]` | public |
| `marketPrice.getTrend` | `{ productName, province?, days }` | `TrendData` | public |

### ۳-۲. صفحات گزارش بازار

```
/market/reports               # لیست گزارش‌های بازار
/market/reports/[slug]        # صفحه گزارش با نمودارها
/market/prices                # قیمت‌های روز بازار
/market/prices/[productName]  # نمودار قیمت یک محصول در زمان
/admin/content/reports        # مدیریت گزارش‌ها
/admin/content/prices         # مدیریت قیمت‌ها (افزودن/ایمپورت)
```

### ۳-۳. نمودارها

- استفاده از **Recharts** یا **Chart.js** در فرانت‌اند
- نمودار خطی قیمت در زمان (برای یک محصول)
- نمودار میله‌ای مقایسه قیمت بین استان‌ها
- نمودار دایره‌ای سهم بازار دسته‌بندی‌ها
- داده‌ها از `marketPrices` و `productPriceHistory`

### ۳-۴. ایمپورت قیمت

- پشتیبانی از ایمپورت CSV/Excel برای قیمت‌های روزانه
- منابع احتمالی: سامانه جهاد کشاورزی، بازار محلی، داده‌های دستی
- اعتبارسنجی داده‌ها قبل از ذخیره
- job صف (BullMQ) برای پردازش فایل‌های بزرگ

---

## مرحله ۴: سیستم تبلیغات

### ۴-۱. tRPC Router تبلیغات

| Endpoint | ورودی | خروجی | دسترسی |
|---|---|---|---|
| `ad.create` | `{ title, type, placement, imageUrl, targetUrl, ... }` | `Ad` | admin |
| `ad.update` | `{ id, ...fields }` | `Ad` | admin |
| `ad.delete` | `{ id }` | `{ success }` | admin |
| `ad.list` | `{ placement?, active?, page }` | `{ items, total }` | admin |
| `ad.getActive` | `{ placement? }` | `Ad[]` | public (auto-served) |
| `ad.trackImpression` | `{ id }` | `{ success }` | public |
| `ad.trackClick` | `{ id }` | `{ success }` | public |

### ۴-۲. کامپوننت تبلیغات

- `AdBanner` — بنر بالای صفحه (responsive)
- `AdSidebar` — بنر کناری
- `AdInline` — تبلیغ درون‌متنی بین مقالات
- تبلیغات بر اساس `placement` و `startDate/endDate` به‌صورت خودکار فیلتر می‌شوند
- شمارش impression و click به‌صورت async (BullMQ) برای جلوگیری از کندی

---

## مرحله ۵: شبکه ارتباطی کشاورزان

### ۵-۱. tRPC Router شبکه

| Endpoint | ورودی | خروجی | دسترسی |
|---|---|---|---|
| `network.create` | `{ name, description, type, ... }` | `Network` | farmer, company |
| `network.update` | `{ id, ...fields }` | `Network` | network admin |
| `network.list` | `{ type?, province?, categoryId?, page }` | `{ items, total }` | public |
| `network.get` | `{ id }` | `Network` | public / member (if private) |
| `network.join` | `{ networkId }` | `{ success }` | authenticated |
| `network.leave` | `{ networkId }` | `{ success }` | member |
| `network.getMyNetworks` | — | `Network[]` | authenticated |
| `network.post.create` | `{ networkId, content, images? }` | `Post` | member |
| `network.post.list` | `{ networkId, page }` | `{ items, total }` | member |
| `network.post.like` | `{ postId }` | `{ success }` | member |
| `network.comment.create` | `{ postId, content, parentId? }` | `Comment` | member |
| `network.comment.list` | `{ postId, page }` | `{ items, total }` | member |

### ۵-۲. صفحات شبکه

```
/networks                     # لیست شبکه‌ها
/networks/[id]                # صفحه شبکه + پست‌ها
/networks/create              # ایجاد شبکه جدید
/networks/my                  # شبکه‌های من
```

### ۵-۳. قابلیت‌ها

- شبکه‌های منطقه‌ای (بر اساس استان)
- شبکه‌های محصولی (بر اساس دسته‌بندی محصول — مثلاً شبکه گندم‌کاران)
- شبکه‌های تعاونی
- پست‌گذاری با تصویر
- نظرات و پاسخ به نظرات
- لایک پست‌ها
- نوتیفیکیشن برای پست‌های جدید در شبکه‌های عضو

---

## مرحله ۶: رتبه‌بندی پیشرفته فعالان

### ۶-۱. سیستم امتیازدهی چندعاملی

امتیاز اعتباری (creditScore) بر اساس عوامل زیر محاسبه می‌شود:

| عامل | وزن | توضیح |
|---|---|---|
| تعداد سفارش‌های موفق | ۲۵٪ | نسبت سفارش‌های delivered به کل |
| امتیاز ارزیابی | ۳۰٪ | میانگین امتیاز دریافتی (کیفیت + تحویل + ارتباط) |
| تأیید پروفایل | ۱۵٪ | آیا توسط ادمین تأیید شده |
| قدمت | ۱۰٪ | مدت زمان عضویت فعال |
| پاسخگویی | ۱۰٪ | سرعت پاسخ به پیام‌ها و RFQ |
| گواهی‌ها | ۱۰٪ | تعداد گواهی‌های معتبر (GAP، ارگانیک،...) |

### ۶-۲. محاسبه خودکار

- job دوره‌ای (هر شب) با BullMQ — محاسبه مجدد creditScore برای تمام فعالان
- ذخیره تاریخچه امتیاز در جدول `credit_score_history`
- نمایش نمودار تغییر امتیاز در پروفایل

### ۶-۳. tRPC Router رتبه‌بندی

| Endpoint | ورودی | خروجی | دسترسی |
|---|---|---|---|
| `ranking.getTopFarmers` | `{ province?, crop?, limit }` | `FarmerRank[]` | public |
| `ranking.getTopSuppliers` | `{ category?, province?, limit }` | `SupplierRank[]` | public |
| `ranking.getTopCompanies` | `{ province?, limit }` | `CompanyRank[]` | public |
| `ranking.getScoreHistory` | `{ userId }` | `ScorePoint[]` | owner / admin |
| `ranking.recalculate` | — | `{ success }` | admin (manual trigger) |

---

## مرحله ۷: فرم‌های همکاری و استعلام

### ۷-۱. صفحات عمومی

```
/contact                      # فرم تماس و استعلام
/cooperation                  # فرم درخواست همکاری
/about                        # درباره پروژه پیکسل
```

### ۷-۲. tRPC Router استعلام

| Endpoint | ورودی | خروجی | دسترسی |
|---|---|---|---|
| `inquiry.create` | `{ type, name, phone, subject, message }` | `Inquiry` | public |
| `inquiry.list` | `{ type?, status?, page }` | `{ items, total }` | admin, moderator |
| `inquiry.get` | `{ id }` | `Inquiry` | admin, moderator |
| `inquiry.respond` | `{ id, response }` | `Inquiry` | admin, moderator |
| `inquiry.updateStatus` | `{ id, status }` | `Inquiry` | admin, moderator |

### ۷-۳. مدیریت استعلام‌ها در پنل ادمین

- لیست استعلام‌های جدید با badge شمارش
- تخصیص استعلام به کارمند
- پاسخ به استعلام + ارسال SMS به کاربر
- تغییر وضعیت (new → reviewed → responded → closed)

---

## مرحله ۸: تست‌های فاز ۳

### ۸-۱. تست‌های خودکار (Vitest)

```
content.test.ts        — CRUD مقاله + انتشار + جستجو + شمارش بازدید
marketReport.test.ts   — CRUD گزارش + قیمت‌ها + نمودار داده + ایمپورت CSV
ad.test.ts             — CRUD تبلیغ + فیلتر placement + impression/click tracking
network.test.ts        — ایجاد شبکه + عضویت + پست + نظر + لایک
ranking.test.ts        — محاسبه creditScore + رتبه‌بندی + تاریخچه
inquiry.test.ts        — ایجاد استعلام + پاسخ + تغییر وضعیت
```

سناریوهای کلیدی:
- ادمین مقاله می‌سازد → draft → publish → کاربر مشاهده می‌کند → شمارش بازدید افزایش می‌یابد
- ادمین قیمت‌های روزانه را ایمپورت می‌کند (CSV) → نمودار قیمت نمایش داده می‌شود
- تبلیغ در placement مشخص نمایش داده می‌شود → impression شمارش می‌شود
- کشاورز شبکه ایجاد می‌کند → دیگران عضو می‌شوند → پست می‌گذارد → نظر دریافت می‌کند
- job محاسبه creditScore اجرا می‌شود → امتیاز فعالان به‌روز می‌شود

### ۸-۲. تست‌های E2E (Playwright)

```
e2e/news.spec.ts           — مشاهده لیست اخبار + خواندن مقاله
e2e/market-report.spec.ts  — مشاهده گزارش بازار + نمودار قیمت
e2e/network.spec.ts        — ایجاد شبکه + عضویت + پست‌گذاری
e2e/contact.spec.ts        — ارسال فرم تماس
e2e/admin-content.spec.ts  — مدیریت محتوا توسط ادمین
```

### ۸-۳. تست میدانی

- انتشار **۵-۱۰ مقاله/خبر واقعی** کشاورزی
- ایجاد **۲-۳ شبکه** واقعی (مثلاً شبکه گندم‌کاران خراسان)
- ایمپورت قیمت‌های واقعی بازار برای **۱۰-۲۰ محصول**
- بررسی:
  - آیا ویرایشگر محتوا برای متن فارسی روان کار می‌کند؟
  - آیا نمودارهای قیمت خوانا هستند؟
  - آیا شبکه‌های ارتباطی مورد استقبال قرار می‌گیرند؟
  - آیا سیستم تبلیغات درست نمایش داده می‌شود؟
  - آیا رتبه‌بندی انگیزه‌بخش است؟

### ۸-۴. چک‌لیست تأیید فاز ۳

- [ ] CMS مقالات با ویرایشگر rich text کار می‌کند
- [ ] اخبار و مقالات در سایت نمایش داده می‌شوند
- [ ] گزارش بازار با نمودارها کار می‌کند
- [ ] ایمپورت قیمت CSV کار می‌کند
- [ ] سیستم تبلیغات بنری فعال است
- [ ] شبکه‌های ارتباطی (ایجاد، عضویت، پست، نظر) کار می‌کنند
- [ ] رتبه‌بندی خودکار creditScore محاسبه می‌شود
- [ ] فرم‌های تماس و همکاری کار می‌کنند
- [ ] پنل مدیریت محتوا کامل است
- [ ] تمام testها pass می‌شوند
- [ ] تست میدانی انجام شده

---

## خروجی نهایی فاز ۳

- CMS کامل برای اخبار و مقالات کشاورزی فعال است
- گزارش‌های بازار با نمودارهای قیمت نمایش داده می‌شوند
- سیستم تبلیغات بنری فعال است
- شبکه‌های ارتباطی کشاورزان فعال است
- رتبه‌بندی پیشرفته فعالان به‌صورت خودکار محاسبه می‌شود
- فرم‌های تماس و همکاری فعال است
- پورتال اطلاع‌رسانی کامل و پویا است
