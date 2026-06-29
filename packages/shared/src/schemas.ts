import { z } from "zod";

// ─── Auth Schemas ───────────────────────────────────────────

export const requestOtpSchema = z.object({
  phone: z
    .string()
    .regex(/^09\d{9}$/, "شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم باشد"),
});

export const verifyOtpSchema = z.object({
  phone: z.string().regex(/^09\d{9}$/),
  code: z.string().regex(/^\d{6}$/, "کد باید ۶ رقم باشد"),
});

export const registerSchema = z.object({
  phone: z.string().regex(/^09\d{9}$/),
  role: z.enum(["farmer", "supplier", "company"]),
  firstName: z.string().min(2, "نام حداقل ۲ کاراکتر").max(100),
  lastName: z.string().min(2, "نام خانوادگی حداقل ۲ کاراکتر").max(100),
  nationalCode: z
    .string()
    .regex(/^\d{10}$/, "کد ملی باید ۱۰ رقم باشد")
    .optional(),
});

// ─── Farmer Profile Schema ──────────────────────────────────

export const farmerProfileSchema = z.object({
  nationalCode: z.string().regex(/^\d{10}$/).optional(),
  farmType: z.enum(["dryland", "irrigated", "greenhouse", "orchard", "livestock", "poultry"]).optional(),
  province: z.string().min(1).max(50).optional(),
  county: z.string().min(1).max(50).optional(),
  district: z.string().max(50).optional(),
  village: z.string().max(100).optional(),
  totalAreaHectares: z.number().positive().transform(String).optional(),
  mainCrops: z.array(z.string()).optional(),
  experienceYears: z.number().int().min(0).max(100).optional(),
  certifications: z.array(z.string()).optional(),
  licenseNumber: z.string().max(50).optional(),
  bio: z.string().max(2000).optional(),
});

// ─── Company Profile Schema ─────────────────────────────────

export const companyProfileSchema = z.object({
  companyName: z.string().min(2).max(200),
  nationalId: z.string().regex(/^\d{11}$/).optional(),
  economicCode: z.string().max(20).optional(),
  registrationNumber: z.string().max(20).optional(),
  companyType: z.enum(["cooperative", "private", "industrial", "governmental"]).optional(),
  province: z.string().max(50).optional(),
  county: z.string().max(50).optional(),
  address: z.string().max(500).optional(),
  postalCode: z.string().regex(/^\d{10}$/).optional(),
  phone: z.string().regex(/^0\d{10}$/).optional(),
  productionLines: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
  importExportHistory: z.boolean().optional(),
  logoUrl: z.string().url().optional(),
  description: z.string().max(5000).optional(),
});

// ─── Supplier Profile Schema ────────────────────────────────

export const supplierProfileSchema = z.object({
  supplierName: z.string().min(2).max(200),
  nationalId: z.string().regex(/^\d{11}$/).optional(),
  province: z.string().max(50).optional(),
  county: z.string().max(50).optional(),
  address: z.string().max(500).optional(),
  phone: z.string().regex(/^0\d{10}$/).optional(),
  supplyCategories: z.array(z.string()).optional(),
  capacityUnit: z.string().max(20).optional(),
  logoUrl: z.string().url().optional(),
  description: z.string().max(5000).optional(),
});

// ─── Product Schema ─────────────────────────────────────────

export const createProductSchema = z.object({
  categoryId: z.number().int().positive(),
  name: z.string().min(2).max(200),
  description: z.string().max(5000).optional(),
  unit: z.string().min(1).max(20),
  pricePerUnit: z.number().positive().optional(),
  currency: z.enum(["IRR", "USD"]).default("IRR"),
  minOrderQuantity: z.number().positive().optional(),
  availableQuantity: z.number().nonnegative().optional(),
  images: z.array(z.string().url()).max(10).optional(),
  specifications: z.record(z.string()).optional(),
  origin: z.string().max(100).optional(),
  brand: z.string().max(100).optional(),
  certifications: z.array(z.string()).optional(),
});

// ─── RFQ Schema ─────────────────────────────────────────────

export const createRfqSchema = z.object({
  categoryId: z.number().int().positive().optional(),
  productName: z.string().min(2).max(200),
  description: z.string().max(5000).optional(),
  quantity: z.number().positive(),
  unit: z.string().min(1).max(20),
  targetPrice: z.number().positive().optional(),
  deliveryProvince: z.string().max(50).optional(),
  deliveryCounty: z.string().max(50).optional(),
  deliveryDeadline: z.string().datetime().optional(),
  attachments: z.array(z.string().url()).optional(),
});

// ─── Order Schema ───────────────────────────────────────────

export const createOrderSchema = z.object({
  supplierId: z.string().uuid(),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        name: z.string(),
        quantity: z.number().positive(),
        unit: z.string(),
        price: z.number().positive(),
      })
    )
    .min(1),
  shippingAddress: z.object({
    province: z.string(),
    county: z.string(),
    address: z.string(),
    postalCode: z.string().optional(),
  }),
  notes: z.string().max(1000).optional(),
});

// ─── Pagination Schema ──────────────────────────────────────

export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});

// ─── Search Schema ──────────────────────────────────────────

export const searchSchema = z.object({
  query: z.string().min(1).max(200),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});

// ─── Article Schema ─────────────────────────────────────────

export const createArticleSchema = z.object({
  title: z.string().min(2).max(250),
  excerpt: z.string().max(500).optional(),
  content: z.string().min(1),
  coverImageUrl: z.string().url().optional(),
  category: z.enum(["news", "article", "report", "guideline", "announcement"]).optional(),
  tags: z.array(z.string()).optional(),
  isFeatured: z.boolean().optional(),
  attachments: z.array(z.string().url()).optional(),
});

// ─── Review Schema ──────────────────────────────────────────

export const createReviewSchema = z.object({
  orderId: z.string().uuid(),
  revieweeType: z.enum(["supplier", "product", "farmer", "company"]),
  revieweeId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  qualityRating: z.number().int().min(1).max(5).optional(),
  deliveryRating: z.number().int().min(1).max(5).optional(),
  communicationRating: z.number().int().min(1).max(5).optional(),
  comment: z.string().max(2000).optional(),
});

// ─── Network Schema ─────────────────────────────────────────

export const createNetworkSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().max(5000).optional(),
  networkType: z.enum(["regional", "crop_based", "cooperative", "general"]).optional(),
  province: z.string().max(50).optional(),
  categoryId: z.number().int().positive().optional(),
  isPrivate: z.boolean().optional(),
  coverImageUrl: z.string().url().optional(),
});

export const createNetworkPostSchema = z.object({
  networkId: z.string().uuid(),
  content: z.string().min(1).max(5000),
  images: z.array(z.string().url()).max(5).optional(),
});

export const createNetworkCommentSchema = z.object({
  postId: z.string().uuid(),
  content: z.string().min(1).max(2000),
  parentId: z.string().uuid().optional(),
});

// ─── Inquiry Schema ─────────────────────────────────────────

export const createInquirySchema = z.object({
  type: z.enum(["cooperation", "inquiry", "complaint", "suggestion"]),
  name: z.string().min(2).max(100),
  phone: z.string().regex(/^09\d{9}$/),
  email: z.string().email().optional(),
  subject: z.string().min(2).max(200),
  message: z.string().min(1).max(5000),
  attachments: z.array(z.string().url()).optional(),
});

// ─── Market Report Schema ───────────────────────────────────

export const createMarketReportSchema = z.object({
  title: z.string().min(2).max(250),
  summary: z.string().min(1).max(1000),
  content: z.string().min(1),
  reportType: z.enum(["price_analysis", "supply_demand", "seasonal", "export_import", "general"]).optional(),
  relatedCategoryIds: z.array(z.number().int()).optional(),
  dataCharts: z.record(z.any()).optional(),
  coverImageUrl: z.string().url().optional(),
});

export const addMarketPriceSchema = z.object({
  productName: z.string().min(1).max(200),
  categoryId: z.number().int().positive().optional(),
  province: z.string().max(50).optional(),
  county: z.string().max(50).optional(),
  minPrice: z.number().positive(),
  maxPrice: z.number().positive(),
  avgPrice: z.number().positive(),
  unit: z.string().min(1).max(20),
  source: z.string().max(100).optional(),
  recordedAt: z.string(),
});

// ─── Ad Schema ──────────────────────────────────────────────

export const createAdSchema = z.object({
  title: z.string().min(2).max(200),
  type: z.enum(["banner", "sidebar", "inline", "popup"]).optional(),
  placement: z.enum(["home_top", "home_sidebar", "market_top", "article_inline", "all_pages"]).optional(),
  imageUrl: z.string().url().optional(),
  targetUrl: z.string().url(),
  startDate: z.string(),
  endDate: z.string(),
});

// ─── Chat Schema ────────────────────────────────────────────

export const sendMessageSchema = z.object({
  conversationId: z.string().uuid(),
  content: z.string().min(1).max(5000),
  attachments: z.array(z.string().url()).optional(),
});

export const startConversationSchema = z.object({
  userId: z.string().uuid(),
  productId: z.string().uuid().optional(),
  orderId: z.string().uuid().optional(),
});

// ─── Bid Schema ─────────────────────────────────────────────

export const placeBidSchema = z.object({
  rfqId: z.string().uuid(),
  offeredPrice: z.number().positive(),
  offeredQuantity: z.number().positive().optional(),
  deliveryTime: z.string().max(100).optional(),
  productId: z.string().uuid().optional(),
  notes: z.string().max(2000).optional(),
});

// ─── Shipment Schema ────────────────────────────────────────

export const createShipmentSchema = z.object({
  orderId: z.string().uuid(),
  carrierType: z.enum(["self", "third_party", "platform"]).optional(),
  carrierName: z.string().max(100).optional(),
  vehicleType: z.string().max(50).optional(),
  isRefrigerated: z.boolean().optional(),
  originAddress: z.string().min(1),
  destinationAddress: z.string().min(1),
  originProvince: z.string().max(50).optional(),
  destinationProvince: z.string().max(50).optional(),
  estimatedCost: z.number().positive().optional(),
  notes: z.string().max(2000).optional(),
});

// ─── Webhook Schema ─────────────────────────────────────────

export const createWebhookSchema = z.object({
  url: z.string().url(),
  events: z.array(z.string()).min(1),
});

// ─── API Key Schema ─────────────────────────────────────────

export const createApiKeySchema = z.object({
  name: z.string().min(2).max(100),
  scopes: z.array(z.string()).optional(),
  expiresAt: z.string().datetime().optional(),
});
