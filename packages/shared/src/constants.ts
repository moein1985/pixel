export const PROVINCES = [
  "آذربایجان شرقی",
  "آذربایجان غربی",
  "اردبیل",
  "اصفهان",
  "البرز",
  "ایلام",
  "بوشهر",
  "تهران",
  "چهارمحال و بختیاری",
  "خراسان جنوبی",
  "خراسان رضوی",
  "خراسان شمالی",
  "خوزستان",
  "زنجان",
  "سمنان",
  "سیستان و بلوچستان",
  "فارس",
  "قزوین",
  "قم",
  "کردستان",
  "کرمان",
  "کرمانشاه",
  "کهگیلویه و بویراحمد",
  "گلستان",
  "گیلان",
  "لرستان",
  "مازندران",
  "مرکزی",
  "هرمزگان",
  "همدان",
  "یزد",
] as const;

export const PRODUCT_CATEGORIES = [
  { name: "بذر و نهال", slug: "seeds-seedlings", type: "input" as const, children: [
    { name: "بذر غلات", slug: "cereal-seeds" },
    { name: "بذر حبوبات", slug: "legume-seeds" },
    { name: "بذر صیفی‌جات", slug: "summer-crop-seeds" },
    { name: "نهال درخت", slug: "tree-seedlings" },
  ]},
  { name: "کود", slug: "fertilizer", type: "input" as const, children: [
    { name: "کود شیمیایی", slug: "chemical-fertilizer" },
    { name: "کود ارگانیک", slug: "organic-fertilizer" },
    { name: "کود بیولوژیک", slug: "biological-fertilizer" },
  ]},
  { name: "سموم کشاورزی", slug: "pesticides", type: "input" as const, children: [
    { name: "حشره‌کش", slug: "insecticide" },
    { name: "قارچ‌کش", slug: "fungicide" },
    { name: "علف‌کش", slug: "herbicide" },
  ]},
  { name: "ماشین‌آلات کشاورزی", slug: "machinery", type: "equipment" as const, children: [
    { name: "تراکتور", slug: "tractor" },
    { name: "کمباین", slug: "combine" },
    { name: "تجهیزات آبیاری", slug: "irrigation-equipment" },
    { name: "ابزار کشت و برداشت", slug: "harvest-tools" },
  ]},
  { name: "دام و طیور", slug: "livestock-poultry", type: "product" as const, children: [
    { name: "خوراک دام و طیور", slug: "animal-feed" },
    { name: "دام زنده", slug: "live-animal" },
    { name: "محصولات لبنی", slug: "dairy-products" },
  ]},
  { name: "گلخانه‌ای", slug: "greenhouse", type: "equipment" as const, children: [
    { name: "ساختار گلخانه", slug: "greenhouse-structure" },
    { name: "تجهیزات گلخانه", slug: "greenhouse-equipment" },
  ]},
  { name: "فرآوری محصولات", slug: "processing", type: "product" as const, children: [
    { name: "فرآوری غلات", slug: "cereal-processing" },
    { name: "فرآوری میوه و سبزی", slug: "fruit-vegetable-processing" },
    { name: "فرآوری لبنیات", slug: "dairy-processing" },
  ]},
  { name: "خدمات کشاورزی", slug: "services", type: "service" as const, children: [
    { name: "آبیاری", slug: "irrigation-service" },
    { name: "کشت و برداشت", slug: "planting-harvesting" },
    { name: "مشاوره کشاورزی", slug: "consulting" },
  ]},
] as const;

export const OTP_CONFIG = {
  CODE_LENGTH: 6,
  EXPIRY_MINUTES: 2,
  MAX_ATTEMPTS: 3,
  RESEND_COOLDOWN_SECONDS: 60,
  DEV_MODE_CODE: "123456",
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

export const CREDIT_SCORE = {
  MIN: 0,
  MAX: 100,
  THRESHOLDS: {
    low: 30,
    medium: 60,
    high: 80,
  },
} as const;

export const RISK_LEVELS = ["low", "medium", "high"] as const;
export type RiskLevel = (typeof RISK_LEVELS)[number];
