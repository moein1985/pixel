# فاز ۵ — بهینه‌سازی، مقیاس‌پذیری و یکپارچه‌سازی

## هدف

پیاده‌سازی PWA، سئوی پیشرفته، داشبوردهای پیشرفته، سیستم لجستیک کشاورزی، یکپارچه‌سازی با سامانه‌های خارجی (API عمومی)، و بهینه‌سازی عملکرد سیستم برای مقیاس‌پذیری.

## مدت تخمینی: ۲-۳ هفته

---

## مرحله ۱: PWA و نسخه موبایل

### ۱-۱. راه‌اندازی PWA

- استفاده از `next-pwa` یا پیکربندی دستی Service Worker
- `manifest.json` با:
  - نام: «پیکسل — شناسنامه هوشمند کشاورزی»
  - آیکون‌های چندسایزه (۱۹۲، ۲۵۶، ۳۸۴، ۵۱۲)
  - theme color: سبز کشاورزی
  - display: standalone
  - lang: fa
  - dir: rtl

### ۱-۲. قابلیت‌های Offline

- کش صفحات اصلی (صفحه اول، بازار، لیست محصولات) با Service Worker
- نمایش صفحات آفلاین با داده‌های کش‌شده
- همگام‌سازی در پس‌زمینه (Background Sync) برای:
  - ارسال پیام چت که در حالت آفلاین نوشته شده
  - ثبت سفارش آفلاین
- نوتیفیکیشن Push برای:
  - پیام جدید چت
  - پاسخ به RFQ
  - تغییر وضعیت سفارش
  - قیمت‌های جدید بازار

### ۱-۳. نصب روی موبایل

- prompt نصب (Add to Home Screen) برای کاربران مکرر
- آیکون مستقل روی صفحه خانه
- اجرای full-screen بدون نوار مرورگر

---

## مرحله ۲: سئوی پیشرفته

### ۲-۱. Metadata پویا

- استفاده از Next.js Metadata API برای هر صفحه
- تگ‌های `title`, `description`, `keywords` فارسی برای هر صفحه
- Open Graph تگ‌ها برای اشتراک‌گذاری در شبکه‌های اجتماعی
- Twitter Card تگ‌ها
- canonical URL برای جلوگیری از محتوای تکراری

### ۲-۲. Structured Data (Schema.org)

- `Organization` برای صفحه درباره
- `Product` برای صفحات محصولات (قیمت، موجودی، تصویر، ارزیابی)
- `Article` برای مقالات و اخبار
- `BreadcrumbList` برای مسیر ناوبری
- `FAQPage` برای صفحات سوالات متداول
- `LocalBusiness` برای پروفایل تأمین‌کنندگان

### ۲-۳. Sitemap و Robots

- `sitemap.xml` پویا (تولید خودکار از دیتابیس)
- شامل: صفحات استاتیک، محصولات، مقالات، پروفایل‌های عمومی
- `robots.txt` با دسترسی به صفحات عمومی و بستن صفحات ادمین/پروفایل خصوصی
- ثبت sitemap در Google Search Console

### ۲-۴. بهینه‌سازی سرعت

- تصاویر: استفاده از `next/image` با WebP/AVIF + lazy loading
- فونت: preload Vazirmatn + `font-display: swap`
- CSS: critical CSS inline + غیرضروری deferred
- JS: code splitting + dynamic import برای صفحات کم‌استفاده
- کش: `Cache-Control` headers مناسب برای Nginx
- CDN: برای فایل‌های استاتیک (در آینده)

### ۲-۵. صفحات فرود (Landing Pages) اختصاصی

- `/products/[slug]` — صفحه فرود محصول با سئوی قوی
- `/suppliers/[id]/products` — صفحه فرود تأمین‌کننده
- `/category/[slug]` — صفحه فرود دسته‌بندی
- `/province/[name]` — صفحه فرود استان (کشاورزان و تأمین‌کنندگان استان)

---

## مرحله ۳: داشبوردهای پیشرفته

### ۳-۱. داشبورد کشاورز (پیشرفته)

```
/dashboard/farmer
```

قابلیت‌ها:
- **خلاصه روزانه**: سفارش‌های فعال، پیام‌های جدید، قیمت‌های مهم
- **نمودار خرید ماهانه**: مبلغ خرید در ۶ ماه گذشته
- **پیشنهادهای هوشمند**: محصولات پیشنهادی بر اساس نوع کشت
- **هشدار قیمت**: محصولات مورد نیاز با تغییر قیمت >۱۰٪
- **RFQ‌های فعال**: وضعیت درخواست‌های خرید
- **شبکه‌های من**: شبکه‌های عضو + پست‌های جدید
- **آموزش‌ها**: مقالات مرتبط با نوع کشت کاربر

### ۳-۲. داشبورد تأمین‌کننده (پیشرفته)

```
/dashboard/supplier
```

قابلیت‌ها:
- **آمار فروش**: تعداد سفارش، مبلغ کل، میانگین قیمت (هفتگی/ماهانه)
- **نمودار فروش**: فروش در ۳۰ روز گذشته (خطی)
- **محصولات پربازدید**: top 5 محصولات با بیشترین بازدید
- **سفارش‌های در انتظار**: لیست با اولویت زمان
- **RFQ‌های مرتبط**: RFQ‌های باز در دسته‌بندی‌های تأمین‌کننده
- **تحلیل رقبا**: مقایسه قیمت با تأمین‌کنندگان مشابه
- **امتیاز و ریسک**: نمایش creditScore و riskLevel فعلی
- **هشدار موجودی**: محصولات با موجودی پایین

### ۳-۳. داشبورد شرکت/تعاونی (پیشرفته)

```
/dashboard/company
```

قابلیت‌ها:
- **مدیریت زنجیره تأمین**: نمایش گرافیکی تأمین‌کنندگان فعال
- **قراردادها**: لیست قراردادهای فعال و منقضی‌شده
- **گزارش خرید ماهانه**: مبلغ خرید به تفکیک دسته‌بندی
- **تحلیل مصرف**: نمودار مصرف نهاده‌ها در زمان
- **پیش‌بینی نیاز**: بر اساس الگوی خرید قبلی + فصل کشت
- **تأمین‌کنندگان پیشنهادی**: توصیه‌گر AI

### ۳-۴. داشبورد سازمانی (Admin)

```
/admin/dashboard
```

قابلیت‌ها:
- **آمار کلی**: کاربران، سفارش‌ها، مبلغ تراکنش‌ها (روزانه/هفتگی/ماهانه)
- **نمودار رشد**: کاربران جدید در زمان
- **نقشه حرارتی**: توزیع جغرافیایی کاربران روی نقشه ایران
- **بازار فعال**: محصولات پربازدید، دسته‌بندی‌های پرتراکنش
- **هشدارهای سیستم**: تقلب، پروفایل‌های در انتظار تأیید، شکایات
- **عملکرد سیستم**: response time، error rate، uptime
- **گزارش مالی**: مبلغ تراکنش‌ها، کارمزد درگاه

### ۳-۵. نمودارها

استفاده از **Recharts** برای تمام نمودارها:
- نمودار خطی (فروش، قیمت، رشد)
- نمودار میله‌ای (مقایسه، آمار)
- نمودار دایره‌ای (سهم، توزیع)
- نمودار سطحی (area chart برای حجم)
- نمودار راداری (مقایسه چندعاملی تأمین‌کننده)
- نقشه حرارتی ایران (با کتابخانه SVG نقشه ایران)

---

## مرحله ۴: سیستم لجستیک کشاورزی

### ۴-۱. Schema لجستیک

```typescript
// shipments — محموله‌ها
export const shipments = pgTable("shipments", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").references(() => orders.id).notNull(),
  shipmentNumber: varchar("shipment_number", { length: 20 }).notNull().unique(),
  carrierType: carrierType("carrier_type"), // self | third_party | platform
  carrierName: varchar("carrier_name", { length: 100 }),
  vehicleType: varchar("vehicle_type", { length: 50 }), // truck | pickup | van | refrigerated
  isRefrigerated: boolean("is_refrigerated").default(false), // برای محصولات فاسدشدنی
  originAddress: text("origin_address").notNull(),
  destinationAddress: text("destination_address").notNull(),
  originProvince: varchar("origin_province", { length: 50 }),
  destinationProvince: varchar("destination_province", { length: 50 }),
  estimatedCost: numeric("estimated_cost", { precision: 14, scale: 2 }),
  actualCost: numeric("actual_cost", { precision: 14, scale: 2 }),
  status: shipmentStatus("status").default("preparing"), // preparing | picked_up | in_transit | delivered | failed
  trackingCode: varchar("tracking_code", { length: 50 }),
  pickupAt: timestamp("pickup_at"),
  deliveredAt: timestamp("delivered_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// shipment_tracking — نقاط ردیابی
export const shipmentTracking = pgTable("shipment_tracking", {
  id: uuid("id").primaryKey().defaultRandom(),
  shipmentId: uuid("shipment_id").references(() => shipments.id).notNull(),
  latitude: numeric("latitude", { precision: 10, scale: 7 }),
  longitude: numeric("longitude", { precision: 10, scale: 7 }),
  status: varchar("status", { length: 50 }).notNull(),
  note: text("note"),
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
});
```

### ۴-۲. قابلیت‌ها

- انتخاب نوع حمل (خود تأمین‌کننده، شخص ثالث، پلتفرم)
- پشتیبانی از حمل سردخانه‌ای برای محصولات فاسدشدنی
- محاسبه هزینه تقریبی حمل بر اساس مسافت و نوع وسیله
- ردیابی محموله (manual یا GPS integration در آینده)
- نوتیفیکیشن در تغییر وضعیت محموله
- نمایش timeline وضعیت در صفحه سفارش

### ۴-۳. صفحات

```
/orders/[id]/shipment         # جزئیات محموله + timeline
/supplier/shipments           # مدیریت محموله‌ها (تأمین‌کننده)
/admin/shipments              # مدیریت همه محموله‌ها (ادمین)
```

---

## مرحله ۵: یکپارچه‌سازی با سامانه‌های خارجی

### ۵-۱. API عمومی (REST)

استفاده از `trpc-openapi` برای تولید endpointهای REST از tRPC:

```typescript
// apps/api/src/trpc/openapi.ts
import { generateOpenApiDocument } from "trpc-openapi";

export const openApiDocument = generateOpenApiDocument(appRouter, {
  title: "Pixel API",
  version: "1.0.0",
  baseUrl: "http://192.168.85.92/api",
});
```

endpointهای REST برای استفاده خارجی:
- `GET /api/v1/products` — لیست محصولات
- `GET /api/v1/products/:id` — جزئیات محصول
- `GET /api/v1/suppliers` — لیست تأمین‌کنندگان
- `GET /api/v1/market-prices` — قیمت‌های بازار
- `POST /api/v1/webhooks/order-status` — webhook برای تغییر وضعیت سفارش

### ۵-۲. اتصال به سامانه‌های کشاورزی (آینده)

**سامانه جهاد کشاورزی:**
- دریافت قیمت‌های رسمی محصولات
- دریافت اطلاعات مجوزهای کشاورزی
- webhook برای به‌روزرسانی قیمت‌ها

**سامانه گمرک (برای صادرات):**
- استعلام وضعیت صادرات محصولات کشاورزی
- دریافت آمار صادرات

**ERP/CRM شرکت‌ها:**
- API برای همگام‌سازی سفارش‌ها با ERP شرکت
- webhook برای تغییر موجودی

### ۵-۳. سیستم Webhook

```typescript
// webhooks — ثبت webhook برای مصرف‌کنندگان خارجی
export const webhooks = pgTable("webhooks", {
  id: uuid("id").primaryKey().defaultRandom(),
  url: text("url").notNull(),
  events: text("events").array().notNull(), // ["order.created", "order.status_changed", "price.updated"]
  secret: text("secret").notNull(),          // برای تأیید امضا
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// webhook_deliveries — تاریخچه ارسال‌ها
export const webhookDeliveries = pgTable("webhook_deliveries", {
  id: uuid("id").primaryKey().defaultRandom(),
  webhookId: uuid("webhook_id").references(() => webhooks.id).notNull(),
  event: varchar("event", { length: 50 }).notNull(),
  payload: jsonb("payload"),
  statusCode: integer("status_code"),
  response: text("response"),
  deliveredAt: timestamp("delivered_at"),
  retryCount: integer("retry_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

### ۵-۴. API Key Management

```typescript
// api_keys — کلیدهای API برای مصرف‌کنندگان خارجی
export const apiKeys = pgTable("api_keys", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  keyHash: text("key_hash").notNull(),        // hash کلید (نه خود کلید)
  scopes: text("scopes").array(),              // ["read:products", "read:prices", "write:orders"]
  lastUsedAt: timestamp("last_used_at"),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

---

## مرحله ۶: بهینه‌سازی عملکرد

### ۶-۱. کشینگ

| داده | استراتژی کش | TTL |
|---|---|---|
| لیست دسته‌بندی‌ها | Redis | ۱ ساعت |
| لیست استان‌ها/شهرستان‌ها | Redis | ۲۴ ساعت |
| صفحه اصلی پورتال | Next.js ISR | ۵ دقیقه |
| لیست محصولات (بدون فیلتر) | Redis | ۲ دقیقه |
| پروفایل عمومی کاربر | Redis | ۵ دقیقه |
| قیمت‌های بازار | Redis | ۱ دقیقه |
| نتیجه چت‌بات (پرسش‌های تکراری) | Redis | ۱ ساعت |
| تصاویر | Nginx + MinIO | ۳۰ روز |

### ۶-۲. بهینه‌سازی دیتابیس

```sql
-- Indexهای مهم
CREATE INDEX idx_products_category_price ON products (category_id, price_per_unit);
CREATE INDEX idx_products_supplier_active ON products (supplier_id, is_active) WHERE is_active = true;
CREATE INDEX idx_orders_buyer_status ON orders (buyer_id, status);
CREATE INDEX idx_orders_supplier_status ON orders (supplier_id, status);
CREATE INDEX idx_market_prices_product_date ON market_prices (product_name, recorded_at DESC);
CREATE INDEX idx_rfqs_status_created ON rfqs (status, created_at DESC) WHERE status = 'open';

-- Partitioning برای جداول بزرگ (در آینده)
-- market_prices را بر اساس recorded_at پارتیشن کنید (ماهانه)
-- messages را بر اساس created_at پارتیشن کنید
```

### ۶-۳. بهینه‌سازی Next.js

- `output: "standalone"` در `next.config.js` برای Docker
- `experimental: { optimizePackageImports: [...] }` برای کاهش bundle size
- `dynamic` import برای صفحات کم‌استفاده (ادمین، گزارش‌ها)
- Image optimization با `next/image` (WebP/AVIF)
- `revalidate` برای صفحات ISR

### ۶-۴. مانیتورینگ

- **Health check endpoint**: `GET /api/health` — وضعیت تمام سرویس‌ها
- **Metrics endpoint**: `GET /api/metrics` — آمار request count, response time, error rate
- **Logging**: ساختار یافته (JSON) با levels (debug, info, warn, error)
- **Error tracking**: ذخیره خطاها در دیتابیس + نوتیفیکیشن ادمین برای خطاهای بحرانی
- **Docker health checks**: برای تمام کانتینرها

---

## مرحله ۷: فروشگاه اختصاصی تأمین‌کننده (Optional)

### ۷-۱. مفهوم

هر تأمین‌کننده می‌تواند یک صفحه فروشگاه اختصاصی داشته باشد با URL اختصاصی:

```
/shop/[supplierSlug]          # فروشگاه اختصاصی تأمین‌کننده
```

### ۷-۲. قابلیت‌ها

- صفحه اختصاصی با لوگو، توضیحات، و محصولات تأمین‌کننده
- امکان شخصی‌سازی رنگ و چیدمان (محدود)
- بلاگ اختصاصی (در صورت درخواست)
- لینک مستقیم برای اشتراک‌گذاری
- آمار بازدید فروشگاه
- نمایش گواهی‌ها و مجوزها

### ۷-۳. tRPC Router

| Endpoint | ورودی | خروجی | دسترسی |
|---|---|---|---|
| `shop.get` | `{ slug }` | `ShopProfile` | public |
| `shop.update` | `{ ...fields }` | `ShopProfile` | supplier (owner) |
| `shop.getStats` | — | `ShopStats` | supplier (owner) |

---

## مرحله ۸: تست‌های فاز ۵

### ۸-۱. تست‌های خودکار

```
pwa.test.ts              — تست Service Worker + offline cache
seo.test.ts              — تست metadata + structured data + sitemap
dashboard.test.ts        — تست داده‌های داشبورد + نمودار
logistics.test.ts        — تست ایجاد محموله + ردیابی + تغییر وضعیت
webhook.test.ts          — تست ارسال webhook + retry + امضا
api-key.test.ts          — تست ایجاد/استفاده/ابطال API key
cache.test.ts            — تست کش Redis + invalidation
performance.test.ts      — تست response time + concurrent requests
```

### ۸-۲. تست‌های E2E

```
e2e/pwa.spec.ts              — نصب PWA + کار آفلاین
e2e/dashboard-farmer.spec.ts  — داشبورد کشاورز
e2e/dashboard-supplier.spec.ts — داشبورد تأمین‌کننده
e2e/shipment.spec.ts          — جریان لجستیک
e2e/api-rest.spec.ts          — تست endpointهای REST
```

### ۸-۳. تست عملکرد

```bash
# تست بار با k6 یا autocannon:
npx autocannon -c 50 -d 30 http://192.168.85.92/api/health
npx autocannon -c 20 -d 60 http://192.168.85.92/market

# هدف:
# - صفحه اصلی: < 2s (First Contentful Paint)
# - API response: < 200ms (p95)
# - جستجو: < 500ms (p95)
# - 50 concurrent users بدون خطا
```

### ۸-۴. تست میدانی

- تست PWA روی **۳-۵ موبایل واقعی** (اندروید + iOS)
- تست نصب روی صفحه خانه و استفاده آفلاین
- تست داشبوردها با **کاربران واقعی** و جمع‌آوری بازخورد
- تست لجستیک با **۲-۳ سفارش واقعی** با حمل فیزیکی
- بررسی:
  - آیا PWA روی موبایل روان کار می‌کند؟
  - آیا داشبوردها اطلاعات مفید نمایش می‌دهند؟
  - آیا سیستم لجستیک کاربردی است؟
  - آیا API عمومی برای استفاده خارجی آماده است؟
  - آیا سرعت سایت در حالت چندکاربره قابل قبول است؟

### ۸-۵. چک‌لیست تأیید فاز ۵

- [ ] PWA فعال است (manifest + service worker + offline)
- [ ] نصب روی موبایل کار می‌کند
- [ ] نوتیفیکیشن Push فعال است
- [ ] metadata و structured data در تمام صفحات وجود دارد
- [ ] sitemap.xml پویا تولید می‌شود
- [ ] داشبوردهای پیشرفته برای تمام نقش‌ها فعال است
- [ ] نمودارها با داده‌های واقعی پر می‌شوند
- [ ] سیستم لجستیک کار می‌کند (ایجاد محموله + ردیابی + تحویل)
- [ ] API عمومی REST فعال است
- [ ] سیستم Webhook کار می‌کند
- [ ] API Key management فعال است
- [ ] کشینگ Redis برای داده‌های پراستفاده فعال است
- [ ] Indexهای دیتابیس بهینه شده‌اند
- [ ] تست بار با ۵۰ کاربر همزمان بدون خطا پاس می‌شود
- [ ] مانیتورینگ و health check فعال است
- [ ] تمام testها pass می‌شوند

---

## خروجی نهایی فاز ۵

- PWA کامل با قابلیت نصب و کار آفلاین
- سئوی پیشرفته با metadata پویا و structured data
- داشبوردهای پیشرفته با نمودار برای تمام نقش‌ها
- سیستم لجستیک کشاورزی فعال
- API عمومی REST برای یکپارچه‌سازی خارجی
- سیستم Webhook و API Key
- کشینگ و بهینه‌سازی عملکرد
- مانیتورینگ و health check
- فروشگاه اختصاصی تأمین‌کنندگان (optional)

---

## جمع‌بندی کل پروژه

پس از اتمام ۶ فاز (۰ تا ۵)، پروژه «پیکسل — شناسنامه هوشمند کشاورزی» شامل قابلیت‌های زیر خواهد بود:

| قابلیت | فاز |
|---|---|
| زیرساخت Docker + سرور آماده | ۰ |
| احراز هویت OTP + ۴ نقش کاربری | ۱ |
| پروفایل کشاورز/تأمین‌کننده/شرکت | ۱ |
| پورتال اطلاع‌رسانی + جستجوی پیشرفته | ۱ |
| پنل مدیریت | ۱ |
| بازار هوشمند B2B | ۲ |
| جستجو + فیلتر + مقایسه محصولات | ۲ |
| درخواست خرید (RFQ) + پیشنهاد قیمت | ۲ |
| سیستم سفارش + درگاه پرداخت ایرانی | ۲ |
| چت real-time | ۲ |
| ارزیابی و امتیازدهی | ۲ |
| CMS مقالات و اخبار | ۳ |
| گزارش بازار + نمودار قیمت | ۳ |
| سیستم تبلیغات | ۳ |
| شبکه ارتباطی کشاورزان | ۳ |
| رتبه‌بندی پیشرفته خودکار | ۳ |
| چت‌بات هوشمند فارسی | ۴ |
| پیش‌بینی قیمت با ML | ۴ |
| تشخیص تصویر محصول و بیماری | ۴ |
| تشخیص تقلب | ۴ |
| تحلیل ریسک تأمین‌کننده | ۴ |
| موتور توصیه‌گر | ۴ |
| PWA + کار آفلاین | ۵ |
| سئوی پیشرفته | ۵ |
| داشبوردهای پیشرفته | ۵ |
| سیستم لجستیک | ۵ |
| API عمومی + Webhook | ۵ |
| بهینه‌سازی و مانیتورینگ | ۵ |
