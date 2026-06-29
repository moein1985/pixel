import { z } from "zod";

// ─── User Roles ─────────────────────────────────────────────
export const userRole = z.enum(["admin", "farmer", "supplier", "company", "moderator"]);
export type UserRole = z.infer<typeof userRole>;

// ─── User Status ────────────────────────────────────────────
export const userStatus = z.enum(["pending", "active", "suspended", "rejected"]);
export type UserStatus = z.infer<typeof userStatus>;

// ─── Farm Types ─────────────────────────────────────────────
export const farmType = z.enum(["dryland", "irrigated", "greenhouse", "orchard", "livestock", "poultry"]);
export type FarmType = z.infer<typeof farmType>;

export const farmTypeLabels: Record<FarmType, string> = {
  dryland: "دیمی",
  irrigated: "آبی",
  greenhouse: "گلخانه‌ای",
  orchard: "باغی",
  livestock: "دامداری",
  poultry: "طیور",
};

// ─── Company Types ──────────────────────────────────────────
export const companyType = z.enum(["cooperative", "private", "industrial", "governmental"]);
export type CompanyType = z.infer<typeof companyType>;

export const companyTypeLabels: Record<CompanyType, string> = {
  cooperative: "تعاونی",
  private: "خصوصی",
  industrial: "صنعتی",
  governmental: "دولتی",
};

// ─── Category Types ─────────────────────────────────────────
export const categoryType = z.enum(["product", "input", "equipment", "service"]);
export type CategoryType = z.infer<typeof categoryType>;

export const categoryTypeLabels: Record<CategoryType, string> = {
  product: "محصول",
  input: "نهاده",
  equipment: "تجهیزات",
  service: "خدمات",
};

// ─── Stock Status ───────────────────────────────────────────
export const stockStatus = z.enum(["in_stock", "low_stock", "out_of_stock"]);
export type StockStatus = z.infer<typeof stockStatus>;

// ─── RFQ Status ─────────────────────────────────────────────
export const rfqStatus = z.enum(["open", "closed", "awarded", "cancelled"]);
export type RfqStatus = z.infer<typeof rfqStatus>;

// ─── Bid Status ─────────────────────────────────────────────
export const bidStatus = z.enum(["pending", "accepted", "rejected", "withdrawn"]);
export type BidStatus = z.infer<typeof bidStatus>;

// ─── Order Status ───────────────────────────────────────────
export const orderStatus = z.enum([
  "pending",
  "confirmed",
  "paid",
  "shipped",
  "delivered",
  "cancelled",
  "disputed",
]);
export type OrderStatus = z.infer<typeof orderStatus>;

// ─── Payment Status ─────────────────────────────────────────
export const paymentStatus = z.enum(["unpaid", "pending", "paid", "refunded"]);
export type PaymentStatus = z.infer<typeof paymentStatus>;

// ─── Article Categories ─────────────────────────────────────
export const articleCategory = z.enum(["news", "article", "report", "guideline", "announcement"]);
export type ArticleCategory = z.infer<typeof articleCategory>;

export const articleStatus = z.enum(["draft", "published", "archived"]);
export type ArticleStatus = z.infer<typeof articleStatus>;

// ─── Report Types ───────────────────────────────────────────
export const reportType = z.enum(["price_analysis", "supply_demand", "seasonal", "export_import", "general"]);
export type ReportType = z.infer<typeof reportType>;

// ─── Ad Types ───────────────────────────────────────────────
export const adType = z.enum(["banner", "sidebar", "inline", "popup"]);
export type AdType = z.infer<typeof adType>;

export const adPlacement = z.enum(["home_top", "home_sidebar", "market_top", "article_inline", "all_pages"]);
export type AdPlacement = z.infer<typeof adPlacement>;

// ─── Network Types ──────────────────────────────────────────
export const networkType = z.enum(["regional", "crop_based", "cooperative", "general"]);
export type NetworkType = z.infer<typeof networkType>;

export const networkMemberRole = z.enum(["admin", "moderator", "member"]);
export type NetworkMemberRole = z.infer<typeof networkMemberRole>;

// ─── Inquiry Types ──────────────────────────────────────────
export const inquiryType = z.enum(["cooperation", "inquiry", "complaint", "suggestion"]);
export type InquiryType = z.infer<typeof inquiryType>;

export const inquiryStatus = z.enum(["new", "reviewed", "responded", "closed"]);
export type InquiryStatus = z.infer<typeof inquiryStatus>;

// ─── Reviewee Types ─────────────────────────────────────────
export const revieweeType = z.enum(["supplier", "product", "farmer", "company"]);
export type RevieweeType = z.infer<typeof revieweeType>;

// ─── Carrier Types ──────────────────────────────────────────
export const carrierType = z.enum(["self", "third_party", "platform"]);
export type CarrierType = z.infer<typeof carrierType>;

export const shipmentStatus = z.enum(["preparing", "picked_up", "in_transit", "delivered", "failed"]);
export type ShipmentStatus = z.infer<typeof shipmentStatus>;

// ─── Flag Status ────────────────────────────────────────────
export const flagStatus = z.enum(["pending", "reviewed", "confirmed", "dismissed"]);
export type FlagStatus = z.infer<typeof flagStatus>;
