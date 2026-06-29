# فاز ۴ — ماژول هوش مصنوعی

## هدف

پیاده‌سازی سرویس AI مستقل (Python + FastAPI) شامل: چت‌بات هوشمند فارسی، پیش‌بینی قیمت محصولات کشاورزی، تشخیص تصویر محصول/آفت، تشخیص تقلب، و تحلیل ریسک تأمین‌کننده.

## مدت تخمینی: ۳-۴ هفته

---

## مرحله ۱: معماری سرویس AI

### ۱-۱. ساختار سرویس

```
apps/ai/
├── main.py                    # راه‌اندازی FastAPI
├── core/
│   ├── config.py              # تنظیمات (DB, Redis, Model paths)
│   ├── database.py            # اتصال PostgreSQL (SQLAlchemy)
│   └── redis_client.py        # اتصال Redis
├── routers/
│   ├── chatbot.py             # چت‌بات هوشمند
│   ├── price_prediction.py    # پیش‌بینی قیمت
│   ├── image_recognition.py   # تشخیص تصویر
│   ├── fraud_detection.py     # تشخیص تقلب
│   └── risk_analysis.py       # تحلیل ریسک
├── models/
│   ├── nlp/
│   │   ├── chatbot_engine.py  # موتور چت‌بات
│   │   └── intent_classifier.py # طبقه‌بندی نیت کاربر
│   ├── price/
│   │   ├── predictor.py       # مدل پیش‌بینی قیمت
│   │   └── feature_engine.py  # استخراج ویژگی‌ها
│   ├── vision/
│   │   ├── product_classifier.py # دسته‌بندی محصول
│   │   └── disease_detector.py   # تشخیص آفت/بیماری
│   └── fraud/
│       ├── anomaly_detector.py   # تشخیص ناهنجاری
│       └── risk_scorer.py        # محاسبه ریسک
├── services/
│   ├── market_data.py         # دسترسی به داده‌های بازار از DB
│   └── recommendation.py     # موتور توصیه‌گر
├── tests/
│   ├── test_chatbot.py
│   ├── test_price_prediction.py
│   ├── test_image_recognition.py
│   ├── test_fraud_detection.py
│   └── test_risk_analysis.py
├── requirements.txt
├── Dockerfile
└── .env.example
```

### ۱-۲. ارتباط با Node.js API

سرویس AI از طریق HTTP REST با API اصلی ارتباط دارد:

```
Node.js API  ──── HTTP ────→  FastAPI (AI)
  Port 4000                    Port 8000

- API درخواست کاربر را دریافت می‌کند
- در صورت نیاز به AI، درخواست به FastAPI ارسال می‌کند
- نتیجه AI به کاربر برگردانده می‌شود
- برخی پردازش‌ها async (از طریق BullMQ) انجام می‌شوند
```

### ۱-۳. Endpointهای FastAPI

| Endpoint | متد | ورودی | خروجی | توضیح |
|---|---|---|---|---|
| `/health` | GET | — | `{ status }` | health check |
| `/chatbot/message` | POST | `{ message, userId, context? }` | `{ response, intent, suggestions }` | پاسخ چت‌بات |
| `/chatbot/suggestions` | GET | `{ userId }` | `Suggestion[]` | پیشنهادهای شخصی‌سازی‌شده |
| `/price/predict` | POST | `{ productName, province?, days }` | `{ predictions, confidence }` | پیش‌بینی قیمت |
| `/price/trend` | GET | `{ productName, province?, days }` | `{ trend, direction, change_pct }` | تحلیل روند |
| `/vision/classify` | POST | `{ image (file) }` | `{ category, confidence, suggestions }` | دسته‌بندی محصول |
| `/vision/detect-disease` | POST | `{ image (file) }` | `{ disease, confidence, treatment }` | تشخیص آفت/بیماری |
| `/fraud/check` | POST | `{ supplierId or productId }` | `{ riskLevel, flags, score }` | بررسی تقلب |
| `/risk/supplier` | GET | `{ supplierId }` | `{ riskScore, factors, recommendation }` | تحلیل ریسک |
| `/recommend/suppliers` | POST | `{ productName, quantity, province? }` | `SupplierRecommendation[]` | توصیه تأمین‌کننده |
| `/recommend/products` | GET | `{ userId }` | `ProductRecommendation[]` | توصیه محصول |

---

## مرحله ۲: چت‌بات هوشمند فارسی

### ۲-۱. معماری چت‌بات

```
پیام کاربر (متن فارسی)
         │
    ┌────▼──────────┐
    │ پیش‌پردازش NLP  │ ──→ نرمال‌سازی متن (حذف نیم‌فاصله، یکسان‌سازی ی/ی)
    └────┬──────────┘
         │
    ┌────▼──────────────┐
    │ طبقه‌بندی نیت (Intent)│ ──→ search_product | get_price | find_supplier | ask_advice | general
    └────┬──────────────┘
         │
    ┌────▼──────────────┐
    │ استخراج موجودیت‌ها  │ ──→ نام محصول، استان، مقدار، واحد
    │ (Entity Extraction)│
    └────┬──────────────┘
         │
    ┌────▼──────────────┐
    │ اجرای منطق متناسب  │ ──→ query دیتابیس / توصیه / پاسخ عمومی
    └────┬──────────────┘
         │
    ┌────▼──────────┐
    │ تولید پاسخ فارسی │
    └───────────────┘
```

### ۲-۲. مدل NLP

**رویکرد پیشنهادی (سبک و قابل اجرا):**

- **طبقه‌بندی نیت**: استفاده از مدل `paraphrase-multilingual-MiniLM-L12-v2` (HuggingFace) برای embedding متن فارسی + cosine similarity با intentهای از پیش تعریف‌شده
- **استخراج موجودیت**: regex + دیکشنری محصول‌ها و استان‌ها (بدون نیاز به NER سنگیک)
- **تولید پاسخ**: template-based + داده‌های دیتابیس (بدون نیاز به LLM بزرگ در MVP)

**رویکرد پیشرفته (در صورت دسترسی به GPU/API):**

- استفاده از LLM فارسی (مثل **ParsBERT** یا API مدل‌های زبانی) برای تولید پاسخ طبیعی‌تر
- fine-tuning روی داده‌های کشاورزی فارسی

### ۲-۳. نیت‌های قابل تشخیص (Intents)

| Intent | مثال پیام کاربر | عملکرد |
|---|---|---|
| `search_product` | «کود اوره می‌خوام» | جستجو در محصولات و نمایش نتایج |
| `get_price` | «قیمت گندم چنده؟» | استعلام قیمت از marketPrices |
| `find_supplier` | «تأمین‌کننده بذر گندم در خراسان» | جستجوی تأمین‌کنندگان |
| `get_market_info` | «وضعیت بازار پنبه چطوره؟» | نمایش گزارش بازار |
| `create_rfq` | «۵ تن کود می‌خوام» | راهنمایی برای ایجاد RFQ |
| `ask_advice` | «بهترین زمان کاشت گندم کیه؟» | پاسخ از پایگاه دانش |
| `general` | هر چیز دیگر | پاسخ عمومی + راهنمایی |

### ۲-۴. یکپارچه‌سازی با فرانت‌اند

- ویجت چت‌بات در گوشه پایین تمام صفحات (floating button)
- پنل چت بازشونده با تاریخچه مکالمه
- پیشنهادهای سریع (quick replies) بر اساس نیت تشخیص‌داده‌شده
- در صورت تشخیص `search_product` یا `find_supplier`، لینک به صفحات مرتبط
- ذخیره تاریخچه چت در دیتابیس (جدول `chatbot_conversations`)

### ۲-۵. Schema چت‌بات

```typescript
// chatbot_conversations — تاریخچه مکالمات چت‌بات
export const chatbotConversations = pgTable("chatbot_conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  messages: jsonb("messages"),  // [{ role, content, timestamp, intent? }]
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

---

## مرحله ۳: پیش‌بینی قیمت

### ۳-۱. مدل پیش‌بینی

**رویکرد:**

- استفاده از **XGBoost** یا **LightGBM** برای سری‌های زمانی
- ویژگی‌ها (features):
  - قیمت‌های روزهای گذشته (۷، ۱۴، ۳۰ روز)
  - میانگین متحرک (moving average)
  - فصل کشت/برداشت
  - استان
  - روز هفته / ماه
  - روند کلی بازار
  - عرضه و تقاضا (از تعداد RFQ و سفارش‌ها)

**مراحل:**

1. جمع‌آوری داده‌های `marketPrices` و `productPriceHistory`
2. پیش‌پردازش: نرمال‌سازی، مدیریت داده‌های گمشده
3. تقسیم به train/test (۸۰/۲۰)
4. آموزش مدل
5. ارزیابی با MAE و MAPE
6. ذخیره مدل (joblib/pickle)
7. retraining دوره‌ای (هفتگی) با داده‌های جدید

### ۳-۲. خروجی پیش‌بینی

```json
{
  "productName": "گندم",
  "province": "خراسان رضوی",
  "predictions": [
    { "date": "2026-07-01", "price": 12500000, "lower": 12000000, "upper": 13000000 },
    { "date": "2026-07-02", "price": 12600000, "lower": 12100000, "upper": 13100000 },
    { "date": "2026-07-03", "price": 12700000, "lower": 12200000, "upper": 13200000 }
  ],
  "confidence": 0.78,
  "trend": "increasing",
  "changePct": 2.4,
  "factors": ["فصل برداشت نزدیک است", "عرضه در حال کاهش"]
}
```

### ۳-۳. نمایش در فرانت‌اند

- نمودار خطی با بازه اطمینان (shaded area)
- نشانگر روند (صعودی/نزولی/ثابت)
- درصد تغییر پیش‌بینی‌شده
- عوامل مؤثر (به‌صورت متن ساده فارسی)
- هشدار در صورت پیش‌بینی نوسان شدید

---

## مرحله ۴: تشخیص تصویر

### ۴-۱. دسته‌بندی محصول

**مدل:** Transfer Learning با **MobileNetV3** یا **EfficientNet-B0** (سبک و سریع)

**کلاس‌ها (دسته‌بندی محصولات اصلی):**
- غلات (گندم، جو، برنج، ذرت)
- حبوبات (عدس، نخود، لوبیا)
- صیفی‌جات (گوجه، خیار، بادمجان)
- درختان (سیب، پرتقال، پسته، گردو)
- سبزی‌ها (نعناع، ریحان، کرفس)
- محصولات گلخانه‌ای (گل، گیاه زینتی)

**مراحل:**
1. جمع‌آوری دیتاست تصاویر محصولات کشاورزی ایران
2. Data augmentation (چرخش، تغییر روشنایی، crop)
3. Fine-tune مدل پیش‌آموزیده‌شده
4. ارزیابی با accuracy و confusion matrix
5. ذخیره مدل در ONNX (برای inference سریع‌تر)

### ۴-۲. تشخیص آفت و بیماری گیاهی

**مدل:** Transfer Learning با **ResNet50** یا **EfficientNet-B2**

**کلاس‌ها (بیماری‌های رایج):**
- سفیدک سطحی (Powdery Mildew)
- زنگ گندم (Wheat Rust)
- آفت شته (Aphid)
- پوسیدگی ریشه (Root Rot)
- لکه برگی (Leaf Spot)
- سالم (Healthy)

**خروجی:**

```json
{
  "disease": "wheat_rust",
  "diseaseNameFa": "زنگ گندم",
  "confidence": 0.89,
  "severity": "moderate",
  "treatment": {
    "immediate": "استفاده از قارچ‌کش مناسب (تریادیمفون)",
    "preventive": "استفاده از ارقام مقاوم و رعایت تناوب زراعی",
    "consultExpert": true
  },
  "similarImages": ["url1", "url2"]
}
```

### ۴-۳. یکپارچه‌سازی با فرانت‌اند

- صفحه «تشخیص محصول» — آپلود تصویر + نمایش نتیجه
- صفحه «تشخیص بیماری» — آپلود تصویر برگ/گیاه + نمایش نتیجه و درمان
- در پروفایل محصول: امکان آپلود تصویر و تأیید خودکار دسته‌بندی
- در چت‌بات: امکان ارسال تصویر و دریافت تشخیص

---

## مرحله ۵: تشخیص تقلب

### ۵-۱. الگوهای تقلب قابل تشخیص

| الگو | توضیح | روش تشخیص |
|---|---|---|
| قیمت غیرعادی | قیمت بسیار پایین/بالا نسبت به میانگین بازار | Z-score روی قیمت |
| پروفایل جعلی | اطلاعات ناقص/غیرواقعی | بررسی تطابق کد ملی، شماره، موقعیت |
| فعالیت مشکوک | تعداد زیادی سفارش لغوشده | تحلیل نرخ لغو سفارش |
| ارزیابی جعلی | امتیازهای مثبت متعدد از یک کاربر | تحلیل الگوی ارزیابی |
| محصول تکراری | محصول مشابه با قیمت متفاوت | تشابه متن + اختلاف قیمت |

### ۵-۲. پیاده‌سازی

- سرویس دوره‌ای (هر شب) با BullMQ — بررسی تمام فعالان و محصولات
- محاسبه `fraudScore` (0-100) برای هر تأمین‌کننده و محصول
- در صورت عبور از آستانه، فلگ `is_flagged` در دیتابیس ست می‌شود
- ادمین نوتیفیکیشن دریافت می‌کند
- در پروفایل تأمین‌کننده flagged، هشدار نمایش داده می‌شود

### ۵-۳. Schema

```typescript
// fraud_flags — پرچم‌های تقلب
export const fraudFlags = pgTable("fraud_flags", {
  id: uuid("id").primaryKey().defaultRandom(),
  targetType: varchar("target_type", { length: 20 }).notNull(), // supplier | product | review
  targetId: uuid("target_id").notNull(),
  flagType: varchar("flag_type", { length: 50 }).notNull(),     // abnormal_price | fake_profile | high_cancel_rate
  score: integer("score").notNull(),                             // 0-100
  details: jsonb("details"),                                      // جزئیات الگوی مشکوک
  status: flagStatus("status").default("pending"),               // pending | reviewed | confirmed | dismissed
  reviewedBy: uuid("reviewed_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

---

## مرحله ۶: تحلیل ریسک تأمین‌کننده

### ۶-۱. عوامل ریسک

| عامل | وزن | منبع داده |
|---|---|---|
| نرخ لغو سفارش | ۲۵٪ | orders (cancelled/total) |
| میانگین تأخیر تحویل | ۲۰٪ | orders (actual vs promised delivery) |
| امتیاز کیفیت | ۲۰٪ | reviews (qualityRating) |
| شکایات | ۱۵٪ | inquiries (complaint type) |
| قدمت فعالیت | ۱۰٪ | createdAt |
| حجم معاملات | ۱۰٪ | orders count + total amount |

### ۶-۲. خروجی تحلیل ریسک

```json
{
  "supplierId": "uuid",
  "supplierName": "تأمین‌کننده نهاده آریا",
  "riskScore": 28,
  "riskLevel": "low",
  "factors": [
    { "name": "نرخ لغو سفارش", "value": 5, "risk": "low", "weight": 25 },
    { "name": "میانگین تأخیر تحویل", "value": 2.5, "unit": "روز", "risk": "low", "weight": 20 },
    { "name": "امتیاز کیفیت", "value": 4.2, "risk": "low", "weight": 20 },
    { "name": "شکایات", "value": 0, "risk": "low", "weight": 15 }
  ],
  "recommendation": "این تأمین‌کننده ریسک پایینی دارد. قابل اعتماد برای معامله.",
  "trend": "improving"
}
```

### ۶-۳. نمایش در فرانت‌اند

- در پروفایل تأمین‌کننده: نمایش riskLevel با رنگ (سبز/زرد/قرمز)
- در صفحه مقایسه تأمین‌کنندگان: ستون ریسک
- در نتیجه چت‌بات: هشدار ریسک در صورت توصیه تأمین‌کننده پرریسک
- در پنل ادمین: لیست تأمین‌کنندگان پرریسک

---

## مرحله ۷: موتور توصیه‌گر

### ۷-۱. توصیه تأمین‌کننده

وقتی کاربر به دنبال محصولی است، سیستم تأمین‌کنندگان را بر اساس رتبه می‌دهد:

عوامل رتبه‌بندی:
- تطابق محصول (دقیق / دسته‌بندی مشابه)
- قیمت (ارزان‌تر = امتیاز بالاتر)
- امتیاز ارزیابی
- ریسک تأمین‌کننده (ریسک کمتر = امتیاز بالاتر)
- فاصله جغرافیایی (نزدیک‌تر = بهتر)
- موجودی فعلی
- سرعت پاسخگویی

### ۷-۲. توصیه محصول

برای کاربران واردشده، بر اساس:
- تاریخچه جستجو و خرید
- علاقه‌مندی‌ها
- دسته‌بندی‌های مرتبط با پروفایل (مثلاً کشاورز گندم → توصیه نهاده‌های گندم)
- محصولات پربازدید و پرامتیاز

### ۷-۳. نمایش

- در داشبورد کاربر: بخش «پیشنهادهای ویژه»
- در صفحه محصول: «محصولات مشابه» و «تأمین‌کنندگان بهتر»
- در چت‌بات: پیشنهادهای شخصی‌سازی‌شده
- در صفحه اصلی: محصولات منتخب

---

## مرحله ۸: یکپارچه‌سازی با Node.js API

### ۸-۱. tRPC Routerهای یکپارچه‌سازی AI

**`apps/api/src/trpc/routers/ai.ts`:**

| Endpoint | ورودی | خروجی | دسترسی |
|---|---|---|---|
| `ai.chat` | `{ message, context? }` | `{ response, suggestions }` | authenticated |
| `ai.chatHistory` | `{ page }` | `{ items, total }` | authenticated |
| `ai.predictPrice` | `{ productName, province?, days? }` | `PricePrediction` | public |
| `ai.getPriceTrend` | `{ productName, province? }` | `TrendAnalysis` | public |
| `ai.classifyImage` | `FormData (image)` | `ClassificationResult` | authenticated |
| `ai.detectDisease` | `FormData (image)` | `DiseaseResult` | authenticated |
| `ai.getSupplierRisk` | `{ supplierId }` | `RiskAnalysis` | public |
| `ai.recommendSuppliers` | `{ productName, quantity?, province? }` | `Recommendation[]` | authenticated |
| `ai.recommendProducts` | — | `ProductRecommendation[]` | authenticated |
| `ai.getSuggestions` | — | `Suggestion[]` | authenticated |

### ۸-۲. Proxy در Node.js

API اصلی درخواست‌های AI را به FastAPI_forward می‌کند:

```typescript
// apps/api/src/services/ai-client.ts
// HTTP client برای ارتباط با FastAPI

export async function callAI<T>(path: string, body: any): Promise<T> {
  const response = await fetch(`${process.env.AI_SERVICE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
  return response.json();
}
```

---

## مرحله ۹: صفحات فرانت‌اند AI

```
/ai/chat                      # صفحه چت‌بات کامل
/ai/price-prediction          # پیش‌بینی قیمت محصول
/ai/image-classifier          # تشخیص نوع محصول از تصویر
/ai/disease-detector          # تشخیص آفت و بیماری
/dashboard/recommendations    # پیشنهادهای شخصی‌سازی‌شده
```

کامپوننت‌ها:
- `ChatbotWidget` — ویجت شناور چت‌بات (در تمام صفحات)
- `ChatbotPanel` — پنل کامل چت‌بات با تاریخچه
- `PricePredictionChart` — نمودار پیش‌بینی با بازه اطمینان
- `ImageUploader` — آپلود تصویر با drag & drop + preview
- `ClassificationResult` — نمایش نتیجه تشخیص با confidence
- `DiseaseResultCard` — نمایش بیماری + درمان
- `RiskBadge` — badge سطح ریسک تأمین‌کننده
- `RecommendationCard` — کارت پیشنهاد محصول/تأمین‌کننده

---

## مرحله ۱۰: تست‌های فاز ۴

### ۱۰-۱. تست‌های AI (pytest)

```
test_chatbot.py           — تست طبقه‌بندی نیت + استخراج موجودیت + تولید پاسخ
test_price_prediction.py  — تست مدل پیش‌بینی + ارزیابی MAE/MAPE
test_image_recognition.py — تست دسته‌بندی محصول + تشخیص بیماری (با تصاویر تست)
test_fraud_detection.py   — تست الگوهای تقلب + محاسبه fraudScore
test_risk_analysis.py     — تست محاسبه ریسک + عوامل
test_recommendation.py    — تست موتور توصیه‌گر
```

سناریوهای کلیدی:
- پیام «کود اوره می‌خوام» → intent: search_product → استخراج «کود اوره» → پاسخ با لینک محصولات
- پیام «قیمت گندم چنده» → intent: get_price → استخراج «گندم» → پاسخ با قیمت روز
- پیش‌بینی قیمت گندم برای ۷ روز آینده → خروجی با confidence > ۰.۶
- آپلود تصویر گندم → دسته‌بندی: غلات/گندم با confidence > ۰.۸
- آپلود تصویر برگ بیمار → تشخیص بیماری + درمان
- تأمین‌کننده با نرخ لغو بالا → riskScore بالا + riskLevel: high

### ۱۰-۲. تست‌های یکپارچه‌سازی (Vitest)

```
ai-integration.test.ts    — تست فراخوانی AI از Node.js + پاسخ صحیح
chatbot-e2e.test.ts       — تست چت‌بات از طریق tRPC endpoint
```

### ۱۰-۳. تست‌های E2E (Playwright)

```
e2e/chatbot.spec.ts           — چت با چت‌بات + دریافت پاسخ
e2e/price-prediction.spec.ts  — مشاهده پیش‌بینی قیمت
e2e/image-classifier.spec.ts  — آپلود تصویر + دریافت نتیجه
e2e/disease-detector.spec.ts  — آپلود تصویر بیماری + دریافت درمان
```

### ۱۰-۴. تست میدانی

- **۲۰-۳۰ مکالمه واقعی** با چت‌بات توسط کشاورزان
- تست پیش‌بینی قیمت برای **۵-۱۰ محصول** واقعی و مقایسه با قیمت واقعی بعداً
- تست تشخیص تصویر با **۲۰-۳۰ تصویر** واقعی از محصولات و برگ‌های بیمار
- بررسی:
  - آیا چت‌بات پیام‌های فارسی محاوره‌ای را درست می‌فهمد؟
  - آیا پیش‌بینی قیمت‌ها منطقی است؟
  - آیا تشخیص تصویر دقت قابل قبولی دارد؟
  - آیا توصیه‌های تأمین‌کننده مفید است؟
  - آیا هشدارهای ریسک و تقلب به‌درستی نمایش داده می‌شوند؟

### ۱۰-۵. چک‌لیست تأیید فاز ۴

- [ ] سرویس FastAPI بالا و پاسخ‌گو است
- [ ] چت‌بات فارسی نیت‌های اصلی را تشخیص می‌دهد
- [ ] چت‌بات پاسخ‌های مفید فارسی تولید می‌کند
- [ ] ویجت چت‌بات در تمام صفحات فعال است
- [ ] پیش‌بینی قیمت با confidence قابل قبول کار می‌کند
- [ ] نمودار پیش‌بینی در فرانت‌اند نمایش داده می‌شود
- [ ] تشخیص نوع محصول از تصویر کار می‌کند
- [ ] تشخیص آفت/بیماری + درمان پیشنهادی کار می‌کند
- [ ] سیستم تشخیص تقلب به‌صورت دوره‌ای اجرا می‌شود
- [ ] تحلیل ریسک تأمین‌کننده در پروفایل نمایش داده می‌شود
- [ ] موتور توصیه‌گر پیشنهادهای مرتبط تولید می‌کند
- [ ] تمام testها pass می‌شوند
- [ ] تست میدانی انجام شده و دقت مدل‌ها قابل قبول است

---

## خروجی نهایی فاز ۴

- چت‌بات هوشمند فارسی فعال و در دسترس در تمام صفحات
- پیش‌بینی قیمت محصولات کشاورزی با نمودار و بازه اطمینان
- تشخیص نوع محصول و بیماری گیاهی از تصویر
- سیستم تشخیص تقلب خودکار
- تحلیل ریسک تأمین‌کننده در پروفایل و بازار
- موتور توصیه‌گر شخصی‌سازی‌شده
- سرویس AI مستقل و قابل توسعه
