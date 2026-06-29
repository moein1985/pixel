# فاز ۲ — بازار هوشمند کشاورزی (Smart Marketplace)

## هدف

پیاده‌سازی بازار B2B کشاورزی شامل: مدیریت محصولات، جستجو و فیلتر پیشرفته، استعلام قیمت، درخواست خرید (RFQ)، سیستم سفارش، چت real-time، و سیستم مقایسه تأمین‌کنندگان.

## مدت تخمینی: ۳-۴ هفته

---

## مرحله ۱: Schema بازار

### ۱-۱. جدول محصولات

**`packages/db/src/schema/products.ts`:**

```typescript
// products — محصولات و نهاده‌های کشاورزی
export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  supplierId: uuid("supplier_id").references(() => suppliers.id).notNull(),
  categoryId: integer("category_id").references(() => categories.id).notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 240 }).notNull().unique(),
  description: text("description"),
  unit: varchar("unit", { length: 20 }).notNull(),     // تن، کیلوگرم، عدد، لیتر، بسته
  pricePerUnit: numeric("price_per_unit", { precision: 14, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("IRR"), // IRR | USD
  minOrderQuantity: numeric("min_order_quantity", { precision: 14, scale: 2 }),
  availableQuantity: numeric("available_quantity", { precision: 14, scale: 2 }),
  stockStatus: stockStatus("stock_status").default("in_stock"), // in_stock | low_stock | out_of_stock
  images: text("images").array(),                       // URLهای تصاویر در MinIO
  specifications: jsonb("specifications"),               // مشخصات فنی (key-value)
  origin: varchar("origin", { length: 100 }),            // کشور/منشأ تولید
  brand: varchar("brand", { length: 100 }),
  certifications: text("certifications").array(),         // گواهی‌های محصول
  isActive: boolean("is_active").default(true),
  isVerified: boolean("is_verified").default(false),     // تأیید توسط ناظر
  viewCount: integer("view_count").default(0),
  rating: numeric("rating", { precision: 3, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// product_price_history — تاریخچه قیمت محصول (برای نمودار و تحلیل)
export const productPriceHistory = pgTable("product_price_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id").references(() => products.id).notNull(),
  price: numeric("price", { precision: 14, scale: 2 }).notNull(),
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
});
```

### ۱-۲. جدول درخواست خرید (RFQ)

```typescript
// rfqs — درخواست خرید/استعلام قیمت
export const rfqs = pgTable("rfqs", {
  id: uuid("id").primaryKey().defaultRandom(),
  buyerId: uuid("buyer_id").references(() => users.id).notNull(), // farmer | company
  categoryId: integer("category_id").references(() => categories.id),
  productName: varchar("product_name", { length: 200 }).notNull(),
  description: text("description"),
  quantity: numeric("quantity", { precision: 14, scale: 2 }).notNull(),
  unit: varchar("unit", { length: 20 }).notNull(),
  targetPrice: numeric("target_price", { precision: 14, scale: 2 }),
  deliveryProvince: varchar("delivery_province", { length: 50 }),
  deliveryCounty: varchar("delivery_county", { length: 50 }),
  deliveryDeadline: date("delivery_deadline"),
  status: rfqStatus("status").default("open"), // open | closed | awarded | cancelled
  attachments: text("attachments").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// rfq_bids — پیشنهادهای تأمین‌کنندگان به RFQ
export const rfqBids = pgTable("rfq_bids", {
  id: uuid("id").primaryKey().defaultRandom(),
  rfqId: uuid("rfq_id").references(() => rfqs.id).notNull(),
  supplierId: uuid("supplier_id").references(() => suppliers.id).notNull(),
  productId: uuid("product_id").references(() => products.id),
  offeredPrice: numeric("offered_price", { precision: 14, scale: 2 }).notNull(),
  offeredQuantity: numeric("offered_quantity", { precision: 14, scale: 2 }),
  deliveryTime: varchar("delivery_time", { length: 100 }), // "۳ روز کاری"
  notes: text("notes"),
  status: bidStatus("status").default("pending"), // pending | accepted | rejected | withdrawn
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

### ۱-۳. جدول سفارش

```typescript
// orders — سفارش‌ها
export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderNumber: varchar("order_number", { length: 20 }).notNull().unique(), // PIX-20260101-0001
  buyerId: uuid("buyer_id").references(() => users.id).notNull(),
  supplierId: uuid("supplier_id").references(() => suppliers.id).notNull(),
  items: jsonb("items").notNull(),    // [{ productId, name, quantity, unit, price }]
  totalAmount: numeric("total_amount", { precision: 14, scale: 2 }).notNull(),
  status: orderStatus("status").default("pending"), // pending | confirmed | paid | shipped | delivered | cancelled | disputed
  paymentStatus: paymentStatus("payment_status").default("unpaid"), // unpaid | pending | paid | refunded
  shippingAddress: jsonb("shipping_address"),
  shippingCost: numeric("shipping_cost", { precision: 14, scale: 2 }),
  notes: text("notes"),
  trackingCode: varchar("tracking_code", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// order_status_history — تاریخچه وضعیت سفارش
export const orderStatusHistory = pgTable("order_status_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").references(() => orders.id).notNull(),
  status: orderStatus("status").notNull(),
  note: text("note"),
  changedBy: uuid("changed_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

### ۱-۴. جدول چت

```typescript
// conversations — مکالمات بین کاربران
export const conversations = pgTable("conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  participant1Id: uuid("participant_1_id").references(() => users.id).notNull(),
  participant2Id: uuid("participant_2_id").references(() => users.id).notNull(),
  relatedProductId: uuid("related_product_id").references(() => products.id),
  relatedOrderId: uuid("related_order_id").references(() => orders.id),
  lastMessageAt: timestamp("last_message_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// messages — پیام‌های چت
export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  conversationId: uuid("conversation_id").references(() => conversations.id).notNull(),
  senderId: uuid("sender_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  attachments: text("attachments").array(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

### ۱-۵. جدول مقایسه و ارزیابی

```typescript
// reviews — ارزیابی و امتیازدهی
export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  reviewerId: uuid("reviewer_id").references(() => users.id).notNull(),
  revieweeType: revieweeType("reviewee_type"), // supplier | product | farmer | company
  revieweeId: uuid("reviewee_id").notNull(),
  orderId: uuid("order_id").references(() => orders.id),
  rating: integer("rating").notNull(),    // 1-5
  qualityRating: integer("quality_rating"),    // 1-5
  deliveryRating: integer("delivery_rating"),  // 1-5
  communicationRating: integer("communication_rating"), // 1-5
  comment: text("comment"),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// favorites — علاقه‌مندی‌ها
export const favorites = pgTable("favorites", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  itemType: varchar("item_type", { length: 20 }).notNull(), // product | supplier | farmer
  itemId: uuid("item_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

### ۱-۶. Enumهای جدید

```typescript
export const stockStatus = z.enum(["in_stock", "low_stock", "out_of_stock"]);
export const rfqStatus = z.enum(["open", "closed", "awarded", "cancelled"]);
export const bidStatus = z.enum(["pending", "accepted", "rejected", "withdrawn"]);
export const orderStatus = z.enum([
  "pending", "confirmed", "paid", "shipped", "delivered", "cancelled", "disputed"
]);
export const paymentStatus = z.enum(["unpaid", "pending", "paid", "refunded"]);
export const revieweeType = z.enum(["supplier", "product", "farmer", "company"]);
```

---

## مرحله ۲: مدیریت محصولات (تأمین‌کننده)

### ۲-۱. tRPC Router محصولات

**`apps/api/src/trpc/routers/product.ts`:**

| Endpoint | ورودی | خروجی | دسترسی |
|---|---|---|---|
| `product.create` | `{ name, categoryId, unit, pricePerUnit, ... }` | `Product` | supplier |
| `product.update` | `{ id, ...fields }` | `Product` | supplier (owner) |
| `product.delete` | `{ id }` | `{ success }` | supplier (owner) |
| `product.getMyProducts` | `{ page, status? }` | `{ items, total }` | supplier |
| `product.get` | `{ id }` | `Product` | public |
| `product.list` | `{ categoryId?, supplierId?, province?, minPrice?, maxPrice?, sort?, page }` | `{ items, total }` | public |
| `product.search` | `{ query, page }` | `{ items, total }` | public |
| `product.compare` | `{ productIds: string[] }` | `ProductComparison` | public |
| `product.getPriceHistory` | `{ productId, from?, to? }` | `PricePoint[]` | public |

### ۲-۲. پنل تأمین‌کننده — مدیریت محصولات

صفحات:
```
/supplier/products              # لیست محصولات تأمین‌کننده
/supplier/products/new          # افزودن محصول جدید
/supplier/products/[id]/edit    # ویرایش محصول
```

قابلیت‌ها:
- افزودن محصول با تصاویر چندگانه (آپلود به MinIO)
- مشخصات فنی به‌صورت key-value پویا
- تعیین قیمت، حداقل سفارش، موجودی
- فعال/غیرفعال کردن محصول
- مشاهده آمار بازدید و امتیاز

---

## مرحله ۳: بازار و جستجو

### ۳-۱. صفحه بازار

```
/market                         # صفحه اصلی بازار — دسته‌بندی‌ها + جستجو
/market/category/[slug]         # محصولات یک دسته‌بندی
/market/product/[id]            # صفحه جزئیات محصول
/market/search                  # جستجوی پیشرفته
/market/compare                 # صفحه مقایسه محصولات
```

### ۳-۲. جستجو و فیلتر پیشرفته

فیلترهای بازار:
- **دسته‌بندی** (درختی — والد و فرزند)
- **محدوده قیمت** (min-max)
- **استان تأمین‌کننده**
- **وضعیت موجودی** (موجود / ناموجود)
- **برند**
- **گواهی‌ها** (ارگانیک، GAP، استاندارد)
- **مرتب‌سازی**: قیمت (صعودی/نزولی)، جدیدترین، پربازدیدترین، بالاترین امتیاز

جستجوی متن:
- جستجو در نام محصول، توضیحات، برند
- استفاده از `pg_trgm` برای تطبیق فازی
- استفاده از `unaccent` برای جستجوی بدون نیم‌فاصله

### ۳-۳. صفحه جزئیات محصول

- گالری تصاویر
- مشخصات فنی (جدول key-value)
- قیمت و موجودی
- اطلاعات تأمین‌کننده (با لینک به پروفایل)
- نمودار تاریخچه قیمت (با داده‌های `productPriceHistory`)
- امتیاز و نظرات کاربران
- دکمه‌های: «درخواست خرید»، «استعلام قیمت»، «چت با تأمین‌کننده»، «افزودن به علاقه‌مندی»
- محصولات مشابه

### ۳-۴. سیستم مقایسه

- کاربر می‌تواند ۲-۴ محصول را برای مقایسه انتخاب کند
- جدول مقایسه شامل: قیمت، مشخصات، امتیاز، تأمین‌کننده، موجودی، گواهی‌ها
- ذخیره در localStorage (بدون نیاز به ثبت‌نام برای مقایسه)

---

## مرحله ۴: درخواست خرید (RFQ)

### ۴-۱. جریان RFQ

```
خریدار (farmer/company) درخواست خرید ایجاد می‌کند
         │
    ┌────▼─────┐
    │ RFQ باز    │ ──→ تأمین‌کنندگان مرتبط نوتیفیکیشن می‌گیرند
    └────┬─────┘
         │
    تأمین‌کنندگان پیشنهاد (bid) ثبت می‌کنند
         │
    ┌────▼──────────┐
    │ خریدار پیشنهادها│ ──→ مقایسه قیمت، زمان تحویل، امتیاز تأمین‌کننده
    │ را بررسی می‌کند │
    └────┬──────────┘
         │
    ┌────▼──────┐
    │ پذیرش bid  │ ──→ تبدیل به سفارش (order)
    └───────────┘
```

### ۴-۲. tRPC Router RFQ

| Endpoint | ورودی | خروجی | دسترسی |
|---|---|---|---|
| `rfq.create` | `{ productName, quantity, unit, ... }` | `RFQ` | farmer, company |
| `rfq.getMyRfqs` | `{ status?, page }` | `{ items, total }` | buyer |
| `rfq.list` | `{ categoryId?, province?, status?, page }` | `{ items, total }` | supplier |
| `rfq.get` | `{ id }` | `RFQ with bids` | buyer (owner) / supplier (if open) |
| `rfq.close` | `{ id }` | `{ success }` | buyer (owner) |
| `rfq.placeBid` | `{ rfqId, offeredPrice, deliveryTime, ... }` | `Bid` | supplier |
| `rfq.getMyBids` | `{ status?, page }` | `{ items, total }` | supplier |
| `rfq.acceptBid` | `{ bidId }` | `{ orderId }` | buyer (rfq owner) |
| `rfq.rejectBid` | `{ bidId, reason? }` | `{ success }` | buyer (rfq owner) |

### ۴-۳. صفحات RFQ

```
/rfq                    # لیست RFQ‌های باز (برای تأمین‌کنندگان)
/rfq/new               # ایجاد درخواست خرید جدید
/rfq/my                # RFQ‌های من (خریدار)
/rfq/[id]              # جزئیات RFQ + پیشنهادها
/rfq/bids/my           # پیشنهادهای من (تأمین‌کننده)
```

---

## مرحله ۵: سیستم سفارش

### ۵-۱. جریان سفارش

```
سفارش ایجاد می‌شود (از RFQ یا خرید مستقیم محصول)
         │
    ┌────▼──────┐
    │ pending    │ ──→ تأمین‌کننده تأیید می‌کند
    └────┬──────┘
         │
    ┌────▼──────┐
    │ confirmed  │ ──→ خریدار پرداخت می‌کند
    └────┬──────┘
         │
    ┌────▼──────┐
    │ paid       │ ──→ تأمین‌کننده ارسال می‌کند
    └────┬──────┘
         │
    ┌────▼──────┐
    │ shipped    │ ──→ تحویل به خریدار
    └────┬──────┘
         │
    ┌────▼──────┐
    │ delivered  │ ──→ خریدار تأیید تحویل + ارزیابی
    └───────────┘
```

### ۵-۲. tRPC Router سفارش

| Endpoint | ورودی | خروجی | دسترسی |
|---|---|---|---|
| `order.create` | `{ supplierId, items, shippingAddress }` | `Order` | farmer, company |
| `order.getMyOrders` | `{ status?, page }` | `{ items, total }` | buyer |
| `order.getSupplierOrders` | `{ status?, page }` | `{ items, total }` | supplier |
| `order.get` | `{ id }` | `Order` | buyer/supplier (related) |
| `order.confirm` | `{ id }` | `{ success }` | supplier |
| `order.cancel` | `{ id, reason }` | `{ success }` | buyer (before confirm) / supplier (before paid) |
| `order.markPaid` | `{ id, transactionId }` | `{ success }` | system (payment callback) |
| `order.markShipped` | `{ id, trackingCode }` | `{ success }` | supplier |
| `order.markDelivered` | `{ id }` | `{ success }` | buyer |
| `order.dispute` | `{ id, reason }` | `{ success }` | buyer |

### ۵-۳. صفحات سفارش

```
/orders                # لیست سفارش‌های من (خریدار)
/orders/[id]           # جزئیات سفارش + تاریخچه وضعیت
/supplier/orders       # لیست سفارش‌های دریافتی (تأمین‌کننده)
/supplier/orders/[id]  # مدیریت سفارش (تأیید، ارسال،...)
```

### ۵-۴. درگاه پرداخت

**`apps/api/src/lib/payment.ts`:**

- رابط عمومی برای درگاه‌های ایرانی (زرین‌پال، سامان، آی‌دی‌پی)
- متد `createPayment(amount, callbackUrl, description)` → redirect URL
- متد `verifyPayment(authority, amount)` → تأیید تراکنش
- متد `callbackHandler(queryParams)` → پردازش callback
- ذخیره تراکنش در جدول `transactions`
- در محیط توسعه: شبیه‌سازی پرداخت موفق بدون درگاه واقعی

---

## مرحله ۶: چت Real-time

### ۶-۱. معماری چت

- **Socket.io** برای ارتباط real-time
- **Redis adapter** برای مقیاس‌پذیری (pub/sub)
- ذخیره پیام‌ها در PostgreSQL
- نوتیفیکیشن برای پیام‌های جدید (BullMQ + SMS/push)

### ۶-۲. tRPC + Socket.io

| Endpoint / Event | ورودی | خروجی | دسترسی |
|---|---|---|---|
| `chat.listConversations` | — | `Conversation[]` | authenticated |
| `chat.getMessages` | `{ conversationId, page }` | `{ items, total }` | participant |
| `chat.sendMessage` | `{ conversationId, content }` | `Message` | participant |
| `chat.markAsRead` | `{ conversationId }` | `{ success }` | participant |
| `chat.startConversation` | `{ userId, productId? }` | `Conversation` | authenticated |
| Socket: `message:send` | `{ conversationId, content }` | — | authenticated |
| Socket: `message:receive` | (server push) | `Message` | participant |
| Socket: `typing:start` | `{ conversationId }` | — | participant |
| Socket: `typing:stop` | `{ conversationId }` | — | participant |

### ۶-۳. صفحات چت

```
/messages              # لیست مکالمات
/messages/[id]         # صفحه چت real-time
```

کامپوننت‌ها:
- `ChatList` — لیست مکالمات با آخرین پیام و زمان
- `ChatWindow` — نمایش پیام‌ها + ورودی پیام
- `MessageBubble` — حباب پیام (راست برای فرستنده، چپ برای گیرنده)
- `TypingIndicator` — نمایش در حال تایپ کردن
- `OnlineStatus` — نمایش آنلاین/آفلاین

---

## مرحله ۷: سیستم ارزیابی و امتیازدهی

### ۷-۱. قواعد ارزیابی

- فقط خریدارانی که سفارش `delivered` داشته باشند می‌توانند ارزیابی کنند
- ارزیابی شامل: امتیاز کلی (۱-۵) + امتیاز کیفیت + امتیاز تحویل + امتیاز ارتباط + نظر متنی
- تأمین‌کننده می‌تواند به ارزیابی پاسخ دهد (یک بار)
- میانگین امتیاز در پروفایل تأمین‌کننده و محصول نمایش داده می‌شود
- ارزیابی‌های تأییدشده (خرید واقعی) با badge متمایز می‌شوند

### ۷-۲. tRPC Router ارزیابی

| Endpoint | ورودی | خروجی | دسترسی |
|---|---|---|---|
| `review.create` | `{ orderId, revieweeType, revieweeId, ratings, comment }` | `Review` | buyer (delivered order) |
| `review.list` | `{ revieweeType, revieweeId, page }` | `{ items, total }` | public |
| `review.getMyReviews` | `{ page }` | `{ items, total }` | authenticated |
| `review.reply` | `{ reviewId, reply }` | `{ success }` | supplier/farmer (reviewee) |

---

## مرحله ۸: داشبورد پایه

### ۸-۱. داشبورد کشاورز/خریدار

- آمار سفارش‌ها (در انتظار، در حال ارسال، تحویل‌شده)
- RFQ‌های فعال
- پیام‌های خوانده‌نشده
- محصولات پیشنهادی (بر اساس دسته‌بندی‌های علاقه‌مندی)
- استعلام قیمت‌های اخیر

### ۸-۲. داشبورد تأمین‌کننده

- آمار فروش (تعداد سفارش، مبلغ کل)
- سفارش‌های در انتظار تأیید
- RFQ‌های باز مرتبط
- پیام‌های خوانده‌نشده
- محصولات پربازدید
- نمودار ساده فروش هفتگی

### ۸-۳. داشبورد شرکت/تعاونی

- ترکیبی از داشبورد خریدار + آمار زنجیره تأمین
- قراردادهای فعال (placeholder برای فاز ۵)

---

## مرحله ۹: تست‌های فاز ۲

### ۹-۱. تست‌های خودکار (Vitest)

```
product.test.ts        — CRUD محصول + فیلتر + جستجو + مقایسه + تاریخچه قیمت
rfq.test.ts            — ایجاد RFQ + ثبت bid + پذیرش/رد + تبدیل به سفارش
order.test.ts          — جریان کامل سفارش (pending → delivered) + لغو + dispute
chat.test.ts           — ارسال پیام + ذخیره + markAsRead + Socket.io
review.test.ts         — ارزیابی + محدودیت (فقط بعد از تحویل) + پاسخ
payment.test.ts        — شبیه‌سازی پرداخت + callback + verify
```

سناریوهای کلیدی:
- تأمین‌کننده محصول می‌سازد → خریدار جستجو می‌کند → سفارش می‌دهد → پرداخت → تحویل → ارزیابی
- خریدار RFQ می‌سازد → ۳ تأمین‌کننده bid می‌دهند → خریدار مقایسه می‌کند → پذیرش → سفارش
- چت بین خریدار و تأمین‌کننده در مورد محصول
- مقایسه ۳ محصول در جدول
- فیلتر محصولات بر اساس قیمت + استان + دسته‌بندی

### ۹-۲. تست‌های E2E (Playwright)

```
e2e/market.spec.ts         — جستجو + فیلتر + مشاهده محصول + مقایسه
e2e/rfq.spec.ts            — ایجاد RFQ + ثبت bid + پذیرش
e2e/order.spec.ts          — جریان کامل سفارش
e2e/chat.spec.ts           — چت real-time بین دو کاربر
e2e/review.spec.ts         — ارزیابی بعد از تحویل سفارش
e2e/supplier-panel.spec.ts — مدیریت محصولات + سفارش‌ها
```

### ۹-۳. تست میدانی

- **۵-۱۰ تراکنش واقعی** بین کشاورزان و تأمین‌کنندگان
- تست جریان کامل: جستجو → استعلام → چت → سفارش → پرداخت → تحویل → ارزیابی
- تست RFQ با تأمین‌کنندگان واقعی
- بررسی:
  - آیا جستجو نتایج مرتبط برمی‌گرداند؟
  - آیا فرآیند سفارش روان است؟
  - آیا چت real-time بدون تأخیر کار می‌کند؟
  - آیا درگاه پرداخت درست کار می‌کند؟
  - آیا سیستم امتیازدهی انگیزه ایجاد می‌کند؟

### ۹-۴. چک‌لیست تأیید فاز ۲

- [ ] تأمین‌کنندگان می‌توانند محصولات ایجاد/ویرایش/حذف کنند
- [ ] جستجوی پیشرفته با فیلترهای متعدد کار می‌کند
- [ ] صفحه جزئیات محصول کامل است (تصاویر، قیمت، نمودار، ارزیابی)
- [ ] سیستم مقایسه محصولات کار می‌کند
- [ ] جریان RFQ کامل کار می‌کند (ایجاد → bid → پذیرش → سفارش)
- [ ] جریان سفارش کامل کار می‌کند (pending → delivered)
- [ ] درگاه پرداخت ایرانی فعال است
- [ ] چت real-time با Socket.io کار می‌کند
- [ ] سیستم ارزیابی و امتیازدهی کار می‌کند
- [ ] داشبوردهای خریدار و تأمین‌کننده نمایش داده می‌شوند
- [ ] نوتیفیکیشن‌ها (SMS + in-app) ارسال می‌شوند
- [ ] تمام testها pass می‌شوند
- [ ] تست میدانی انجام شده

---

## خروجی نهایی فاز ۲

- بازار هوشمند کشاورزی فعال با جستجو و فیلتر پیشرفته
- تأمین‌کنندگان می‌توانند محصولات خود را مدیریت و بفروشند
- خریداران می‌توانند محصول پیدا کنند، استعلام قیمت بگیرند، RFQ ثبت کنند
- چت real-time بین طرفین برقرار است
- سیستم سفارش و پرداخت کامل است
- ارزیابی و امتیازدهی فعال است
- داشبوردهای پایه برای تمام نقش‌ها فعال است
