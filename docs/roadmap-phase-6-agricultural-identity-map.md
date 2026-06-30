# فاز ۶ — شناسنامه کشاورزی تعاملی (نقشه هوشمند)

## هدف

پیاده‌سازی بخش «شناسنامه کشاورزی» با نقشه تعاملی ایران که کاربر از سطح کشور به استان و سپس شهرستان حرکت می‌کند (drill-down) و در هر سطح اطلاعات کشاورزی اختصاصی با انیمیشن‌های نرم و حرفه‌ای نمایش داده می‌شود. طراحی در سطح یک پروژه ملی کشوری با تجربه کاربری روان و زیبا.

## مدت تخمینی: ۲-۳ هفته

---

## الهام و مرجع

| منبع | نوع | استفاده |
|---|---|---|
| [react-iran-maps](https://github.com/rezasohrabi/react-iran-maps) | کتابخانه React | نقشه ایران با drill-down استان→شهرستان، انیمیشن Motion، breadcrumb، RTL |
| [Migration Atlas](https://migrationtrack.netlify.app/) | طراحی UX | انیمیشن‌های نرم، طراحی futuristic، پنل اطلاعات کناری |
| [FAO Country Profile Tool](https://www.fao.org/statistics/country-profile-tool) | محتوایی | ساختار داشبورد کشاورزی، نمودارهای تولید |
| [Highcharts Map Drill-Down](https://www.highcharts.com/docs/maps/map-drill-down) | الگوی فنی | الگوی drill-down با انیمیشن زوم |
| [Visual Capitalist](https://www.visualcapitalist.com/mapped-global-fertility-divide/) | طراحی بصری | رنگ‌بندی نقشه، طراحی کشوری و حرفه‌ای |

---

## مرحله ۱: نصب و راه‌اندازی کتابخانه‌ها

### ۱-۱. نصب پکیج‌ها

```bash
cd apps/web
pnpm add react-iran-maps framer-motion recharts
```

### ۱-۲. پکیج‌های مورد نیاز

| پکیج | کاربرد |
|---|---|
| `react-iran-maps` | نقشه تعاملی ایران با drill-down (۳۱ استان + ۴۲۹ شهرستان) |
| `framer-motion` | انیمیشن‌های fade in/out، AnimatePresence، motion transitions |
| `recharts` | نمودارهای دایره‌ای، میله‌ای، خطی برای آمار کشاورزی |

### ۱-۳. تایپ‌های پایه

```typescript
// apps/web/src/app/identity/lib/types.ts

export interface ProvinceData {
  id: string;                    // slug: "fars"
  name: string;                  // "فارس"
  nameEn: string;                // "Fars"
  totalArea: number;             // مساحت زیر کشت (هکتار)
  farmerCount: number;           // تعداد کشاورزان
  annualProduction: number;      // تولید سالانه (تن)
  mainCrops: string[];           // ["گندم", "جو", "خرما"]
  farmTypes: {
    dryland: number;             // درصد دیمی
    irrigated: number;           // درصد آبی
    greenhouse: number;          // درصد گلخانه‌ای
    orchard: number;             // درصد باغی
  };
  trend: number[];               // تولید ۵ سال اخیر (هزار تن)
  counties: CountyData[];
}

export interface CountyData {
  id: string;
  name: string;
  nameEn: string;
  area: number;                  // مساحت زیر کشت (هکتار)
  farmers: number;
  crops: string[];
  farmType: string;
  production: number;            // تولید سالانه (تن)
  registeredFarmers: number;     // کشاورزان ثبت‌شده در پلتفرم
}

export type MapLevel = "country" | "province" | "county";
```

---

## مرحله ۲: دیتای Mock (برای MVP)

### ۲-۱. ساختار دیتای ۳۱ استان

```typescript
// apps/web/src/app/identity/data/mock-data.ts

import { ProvinceData } from "../lib/types";

export const iranProvincesData: ProvinceData[] = [
  {
    id: "tehran", name: "تهران", nameEn: "Tehran",
    totalArea: 45000, farmerCount: 12000, annualProduction: 380000,
    mainCrops: ["سیب‌زمینی", "گندم", "جو", "صیفی‌جات"],
    farmTypes: { dryland: 20, irrigated: 55, greenhouse: 15, orchard: 10 },
    trend: [320, 340, 350, 365, 380],
    counties: [
      { id: "tehran-city", name: "تهران", nameEn: "Tehran", area: 8000, farmers: 3000, crops: ["سیب‌زمینی", "صیفی‌جات"], farmType: "irrigated", production: 80000, registeredFarmers: 120 },
      { id: "shahriar", name: "شهریار", nameEn: "Shahriar", area: 6000, farmers: 2000, crops: ["گندم", "جو"], farmType: "irrigated", production: 60000, registeredFarmers: 80 },
      { id: "varamin", name: "ورامین", nameEn: "Varamin", area: 7000, farmers: 2500, crops: ["پنبه", "گندم"], farmType: "irrigated", production: 70000, registeredFarmers: 95 },
      { id: "damavand", name: "دماوند", nameEn: "Damavand", area: 5000, farmers: 1500, crops: ["سیب", "گیلاس"], farmType: "orchard", production: 45000, registeredFarmers: 50 },
    ],
  },
  {
    id: "fars", name: "فارس", nameEn: "Fars",
    totalArea: 128000, farmerCount: 45000, annualProduction: 1200000,
    mainCrops: ["گندم", "جو", "خرما", "مرکبات", "برنج"],
    farmTypes: { dryland: 45, irrigated: 40, greenhouse: 10, orchard: 5 },
    trend: [950, 980, 1050, 1100, 1200],
    counties: [
      { id: "shiraz", name: "شیراز", nameEn: "Shiraz", area: 15000, farmers: 8000, crops: ["انگور", "مرکبات"], farmType: "orchard", production: 200000, registeredFarmers: 250 },
      { id: "kazeroon", name: "کازرون", nameEn: "Kazeroon", area: 12000, farmers: 5000, crops: ["گندم", "جو"], farmType: "irrigated", production: 150000, registeredFarmers: 120 },
      { id: "marvdasht", name: "مرودشت", nameEn: "Marvdasht", area: 18000, farmers: 7000, crops: ["گندم", "برنج"], farmType: "irrigated", production: 250000, registeredFarmers: 180 },
      { id: "jahrom", name: "جهرم", nameEn: "Jahrom", area: 10000, farmers: 4000, crops: ["خرما", "مرکبات"], farmType: "orchard", production: 180000, registeredFarmers: 90 },
    ],
  },
  {
    id: "khorasan-razavi", name: "خراسان رضوی", nameEn: "Razavi Khorasan",
    totalArea: 165000, farmerCount: 60000, annualProduction: 1800000,
    mainCrops: ["زعفران", "گندم", "جو", "چغندرقند", "خربزه"],
    farmTypes: { dryland: 40, irrigated: 45, greenhouse: 10, orchard: 5 },
    trend: [1500, 1550, 1600, 1700, 1800],
    counties: [
      { id: "mashhad", name: "مشهد", nameEn: "Mashhad", area: 20000, farmers: 10000, crops: ["چغندرقند", "گندم"], farmType: "irrigated", production: 300000, registeredFarmers: 320 },
      { id: "neyshabur", name: "نیشابور", nameEn: "Neyshabur", area: 18000, farmers: 8000, crops: ["زعفران", "گندم"], farmType: "dryland", production: 250000, registeredFarmers: 200 },
      { id: "torbat-e-heydariyeh", name: "تربت حیدریه", nameEn: "Torbat-e Heydariyeh", area: 15000, farmers: 6000, crops: ["زعفران", "گندم"], farmType: "dryland", production: 220000, registeredFarmers: 150 },
    ],
  },
  {
    id: "mazandaran", name: "مازندران", nameEn: "Mazandaran",
    totalArea: 95000, farmerCount: 38000, annualProduction: 950000,
    mainCrops: ["برنج", "مرکبات", "چای", "کیوی"],
    farmTypes: { dryland: 10, irrigated: 70, greenhouse: 15, orchard: 5 },
    trend: [780, 820, 860, 900, 950],
    counties: [
      { id: "sari", name: "ساری", nameEn: "Sari", area: 12000, farmers: 6000, crops: ["برنج", "مرکبات"], farmType: "irrigated", production: 150000, registeredFarmers: 180 },
      { id: "babol", name: "بابل", nameEn: "Babol", area: 10000, farmers: 5000, crops: ["برنج", "کیوی"], farmType: "irrigated", production: 130000, registeredFarmers: 140 },
      { id: "amol", name: "آمل", nameEn: "Amol", area: 11000, farmers: 5500, crops: ["برنج", "مرکبات"], farmType: "irrigated", production: 140000, registeredFarmers: 160 },
    ],
  },
  {
    id: "khuzestan", name: "خوزستان", nameEn: "Khuzestan",
    totalArea: 110000, farmerCount: 35000, annualProduction: 850000,
    mainCrops: ["گندم", "برنج", "خرما", "نیشکر"],
    farmTypes: { dryland: 20, irrigated: 70, greenhouse: 5, orchard: 5 },
    trend: [700, 730, 780, 820, 850],
    counties: [
      { id: "ahvaz", name: "اهواز", nameEn: "Ahvaz", area: 15000, farmers: 7000, crops: ["نیشکر", "گندم"], farmType: "irrigated", production: 200000, registeredFarmers: 150 },
      { id: "dezful", name: "دزفول", nameEn: "Dezful", area: 12000, farmers: 5000, crops: ["گندم", "برنج"], farmType: "irrigated", production: 150000, registeredFarmers: 110 },
      { id: "behbahan", name: "بهبهان", nameEn: "Behbahan", area: 8000, farmers: 3000, crops: ["گندم", "برنج"], farmType: "irrigated", production: 100000, registeredFarmers: 65 },
    ],
  },
  {
    id: "gilan", name: "گیلان", nameEn: "Gilan",
    totalArea: 55000, farmerCount: 28000, annualProduction: 620000,
    mainCrops: ["برنج", "چای", "فندق", "زیتون"],
    farmTypes: { dryland: 5, irrigated: 80, greenhouse: 10, orchard: 5 },
    trend: [520, 540, 570, 600, 620],
    counties: [
      { id: "rasht", name: "رشت", nameEn: "Rasht", area: 8000, farmers: 5000, crops: ["برنج", "چای"], farmType: "irrigated", production: 120000, registeredFarmers: 140 },
      { id: "lahijan", name: "لاهیجان", nameEn: "Lahijan", area: 6000, farmers: 3500, crops: ["چای", "برنج"], farmType: "irrigated", production: 90000, registeredFarmers: 80 },
      { id: "astara", name: "آستارا", nameEn: "Astara", area: 4000, farmers: 2000, crops: ["چای", "فندق"], farmType: "orchard", production: 50000, registeredFarmers: 45 },
    ],
  },
  {
    id: "east-azarbaijan", name: "آذربایجان شرقی", nameEn: "East Azerbaijan",
    totalArea: 85000, farmerCount: 32000, annualProduction: 720000,
    mainCrops: ["گندم", "سیب", "زردآلو", "پسته", "حبوبات"],
    farmTypes: { dryland: 50, irrigated: 30, greenhouse: 10, orchard: 10 },
    trend: [600, 630, 660, 690, 720],
    counties: [
      { id: "tabriz", name: "تبریز", nameEn: "Tabriz", area: 12000, farmers: 5000, crops: ["سیب", "گندم"], farmType: "orchard", production: 150000, registeredFarmers: 130 },
      { id: "maragheh", name: "مراغه", nameEn: "Maragheh", area: 10000, farmers: 4000, crops: ["زردآلو", "سیب"], farmType: "orchard", production: 120000, registeredFarmers: 85 },
      { id: "mianeh", name: "میانه", nameEn: "Mianeh", area: 8000, farmers: 3000, crops: ["گندم", "حبوبات"], farmType: "dryland", production: 80000, registeredFarmers: 50 },
    ],
  },
  {
    id: "kerman", name: "کرمان", nameEn: "Kerman",
    totalArea: 95000, farmerCount: 30000, annualProduction: 680000,
    mainCrops: ["پسته", "خرما", "مرکبات", "گندم"],
    farmTypes: { dryland: 35, irrigated: 45, greenhouse: 10, orchard: 10 },
    trend: [560, 590, 620, 650, 680],
    counties: [
      { id: "kerman-city", name: "کرمان", nameEn: "Kerman", area: 12000, farmers: 5000, crops: ["پسته", "مرکبات"], farmType: "orchard", production: 150000, registeredFarmers: 120 },
      { id: "bam", name: "بم", nameEn: "Bam", area: 10000, farmers: 4000, crops: ["خرما", "مرکبات"], farmType: "orchard", production: 130000, registeredFarmers: 90 },
      { id: "rafsanjan", name: "رفسنجان", nameEn: "Rafsanjan", area: 13000, farmers: 5000, crops: ["پسته"], farmType: "orchard", production: 160000, registeredFarmers: 110 },
    ],
  },
  {
    id: "golestan", name: "گلستان", nameEn: "Golestan",
    totalArea: 65000, farmerCount: 25000, annualProduction: 580000,
    mainCrops: ["گندم", "برنج", "پنبه", "خربزه", "هندوانه"],
    farmTypes: { dryland: 40, irrigated: 50, greenhouse: 5, orchard: 5 },
    trend: [480, 500, 520, 550, 580],
    counties: [
      { id: "gorgan", name: "گرگان", nameEn: "Gorgan", area: 10000, farmers: 5000, crops: ["گندم", "برنج"], farmType: "irrigated", production: 120000, registeredFarmers: 100 },
      { id: "gonbad", name: "گنبد کاووس", nameEn: "Gonbad Kavus", area: 12000, farmers: 5500, crops: ["گندم", "خربزه"], farmType: "dryland", production: 150000, registeredFarmers: 85 },
    ],
  },
  {
    id: "isfahan", name: "اصفهان", nameEn: "Isfahan",
    totalArea: 75000, farmerCount: 28000, annualProduction: 650000,
    mainCrops: ["برنج", "گندم", "صیفی‌جات", "گل و گیاه", "پسته"],
    farmTypes: { dryland: 15, irrigated: 60, greenhouse: 20, orchard: 5 },
    trend: [540, 560, 590, 620, 650],
    counties: [
      { id: "isfahan-city", name: "اصفهان", nameEn: "Isfahan", area: 10000, farmers: 5000, crops: ["برنج", "صیفی‌جات"], farmType: "irrigated", production: 120000, registeredFarmers: 110 },
      { id: "kashan", name: "کاشان", nameEn: "Kashan", area: 8000, farmers: 3000, crops: ["گل و گیاه", "پسته"], farmType: "greenhouse", production: 100000, registeredFarmers: 70 },
    ],
  },
  // ... ادامه ۲۱ استان دیگر با همین الگو
  // آذربایجان غربی، اردبیل، بوشهر، چهارمحال و بختیاری، خراسان شمالی،
  // خراسان جنوبی، زنجان، سمنان، سیستان و بلوچستان، قزوین، قم،
  // کردستان، کهگیلویه و بویراحمد، کرمانشاه، هرمزگان، همدان، یزد،
  // البرز، ایلام، لرستان، مرکزی
];

export function getProvince(id: string): ProvinceData | undefined {
  return iranProvincesData.find((p) => p.id === id);
}

export function getCounty(provinceId: string, countyId: string) {
  return getProvince(provinceId)?.counties.find((c) => c.id === countyId);
}

export const iranTotalStats = {
  totalArea: 1250000,
  farmerCount: 480000,
  annualProduction: 8500000,
  provinces: 31,
  counties: 429,
};
```

> **نکته:** دیتای ۲۱ استان باقی‌مانده با همین الگو تکمیل می‌شود. مقادیر mock و تقریبی هستند و در فاز بعدی با دیتای واقعی جایگزین می‌شوند.

---

## مرحله ۳: کامپوننت‌های نقشه و انیمیشن

### ۳-۱. کامپوننت اصلی نقشه تعاملی

```typescript
// apps/web/src/app/identity/components/InteractiveMap.tsx

"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IranMap } from "react-iran-maps";
import { iranProvincesData, getProvince } from "../data/mock-data";
import { ProvincePanel } from "./ProvincePanel";
import { CountyPanel } from "./CountyPanel";
import { CountryPanel } from "./CountryPanel";
import { MapBreadcrumb } from "./MapBreadcrumb";
import type { MapLevel } from "../lib/types";

export default function InteractiveMap() {
  const [level, setLevel] = useState<MapLevel>("country");
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [selectedCounty, setSelectedCounty] = useState<string | null>(null);

  const handleProvinceClick = useCallback((provinceName: string) => {
    const province = iranProvincesData.find(
      (p) => p.name === provinceName || p.nameEn === provinceName
    );
    if (province) {
      setSelectedProvince(province.id);
      setLevel("province");
    }
  }, []);

  const handleCountyClick = useCallback((countyName: string) => {
    if (!selectedProvince) return;
    const province = getProvince(selectedProvince);
    const county = province?.counties.find(
      (c) => c.name === countyName || c.nameEn === countyName
    );
    if (county) {
      setSelectedCounty(county.id);
      setLevel("county");
    }
  }, [selectedProvince]);

  const handleBack = useCallback(() => {
    if (level === "county") {
      setLevel("province");
      setSelectedCounty(null);
    } else if (level === "province") {
      setLevel("country");
      setSelectedProvince(null);
    }
  }, [level]);

  // داده‌های نقشه برای رنگ‌بندی بر اساس تولید
  const mapData = iranProvincesData.reduce((acc, p) => {
    acc[p.id] = p.annualProduction;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* نقشه — سمت راست */}
      <div className="flex-1 relative min-h-[400px]">
        <AnimatePresence mode="wait">
          {level === "country" && (
            <motion.div
              key="country-map"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="w-full h-full"
            >
              <IranMap
                data={mapData}
                onProvinceClick={handleProvinceClick}
              />
            </motion.div>
          )}
          {level === "province" && selectedProvince && (
            <motion.div
              key={`province-map-${selectedProvince}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="w-full h-full"
            >
              {/* نقشه استان با شهرستان‌ها — react-iran-maps drilldown */}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* پنل اطلاعات — سمت چپ */}
      <div className="w-full lg:w-96 flex flex-col">
        <MapBreadcrumb
          level={level}
          provinceName={getProvince(selectedProvince ?? "")?.name}
          countyName={getProvince(selectedProvince ?? "")?.counties.find(
            (c) => c.id === selectedCounty
          )?.name}
          onBack={handleBack}
        />
        <AnimatePresence mode="wait">
          <motion.div
            key={`${level}-${selectedProvince}-${selectedCounty}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex-1"
          >
            {level === "country" && <CountryPanel />}
            {level === "province" && selectedProvince && (
              <ProvincePanel provinceId={selectedProvince} />
            )}
            {level === "county" && selectedProvince && selectedCounty && (
              <CountyPanel provinceId={selectedProvince} countyId={selectedCounty} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
```

### ۳-۲. Breadcrumb (مسیر ناوبری)

```typescript
// apps/web/src/app/identity/components/MapBreadcrumb.tsx

"use client";

import { ChevronLeft, Home } from "lucide-react";
import type { MapLevel } from "../lib/types";

interface Props {
  level: MapLevel;
  provinceName?: string;
  countyName?: string;
  onBack: () => void;
}

export function MapBreadcrumb({ level, provinceName, countyName, onBack }: Props) {
  return (
    <div className="flex items-center gap-2 mb-4 p-3 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100 shadow-sm">
      <button
        onClick={onBack}
        disabled={level === "country"}
        className="flex items-center gap-1 text-sm text-pixel-700 hover:text-pixel-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        بازگشت
      </button>
      <div className="flex items-center gap-1 text-sm text-gray-500">
        <Home className="w-3.5 h-3.5" />
        <span>ایران</span>
        {provinceName && (
          <>
            <ChevronLeft className="w-3 h-3" />
            <span className="text-gray-700 font-medium">{provinceName}</span>
          </>
        )}
        {countyName && (
          <>
            <ChevronLeft className="w-3 h-3" />
            <span className="text-gray-700 font-medium">{countyName}</span>
          </>
        )}
      </div>
    </div>
  );
}
```

### ۳-۳. پنل اطلاعات کشور (Level 0)

```typescript
// apps/web/src/app/identity/components/CountryPanel.tsx

"use client";

import { Sprout, Users, TrendingUp, MapPin } from "lucide-react";
import { iranTotalStats } from "../data/mock-data";
import { motion } from "framer-motion";

export function CountryPanel() {
  const stats = [
    { icon: Sprout, label: "مساحت زیر کشت", value: "۱.۲۵M هکتار", color: "text-green-600" },
    { icon: Users, label: "کشاورزان", value: "۴۸۰,۰۰۰ نفر", color: "text-blue-600" },
    { icon: TrendingUp, label: "تولید سالانه", value: "۸.۵M تن", color: "text-amber-600" },
    { icon: MapPin, label: "استان‌ها", value: "۳۱ استان", color: "text-purple-600" },
  ];

  return (
    <div className="p-5 rounded-2xl bg-white/90 backdrop-blur-md shadow-lg border border-gray-100">
      <h3 className="text-lg font-bold text-gray-900 mb-1">آمار کشاورزی ایران</h3>
      <p className="text-sm text-gray-500 mb-4">
        برای مشاهده اطلاعات هر استان، روی نقشه کلیک کنید
      </p>
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            className="p-3 rounded-xl bg-gray-50 border border-gray-100"
          >
            <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
            <div className="text-xs text-gray-500">{stat.label}</div>
            <div className="text-sm font-bold text-gray-900">{stat.value}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
```

### ۳-۴. پنل اطلاعات استان (Level 1)

```typescript
// apps/web/src/app/identity/components/ProvincePanel.tsx

"use client";

import { Sprout, Users, TrendingUp, MapPin } from "lucide-react";
import { getProvince } from "../data/mock-data";
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip,
} from "recharts";
import { motion } from "framer-motion";

const FARM_TYPE_COLORS: Record<string, string> = {
  dryland: "#a16207", irrigated: "#0284c7", greenhouse: "#16a34a", orchard: "#ca8a04",
};
const FARM_TYPE_LABELS: Record<string, string> = {
  dryland: "دیمی", irrigated: "آبی", greenhouse: "گلخانه‌ای", orchard: "باغی",
};

export function ProvincePanel({ provinceId }: { provinceId: string }) {
  const province = getProvince(provinceId);
  if (!province) return null;

  const farmTypeData = Object.entries(province.farmTypes).map(([key, value]) => ({
    name: FARM_TYPE_LABELS[key], value, key,
  }));
  const trendData = province.trend.map((value, i) => ({ year: `${1400 + i}`, value }));

  return (
    <div className="p-5 rounded-2xl bg-white/90 backdrop-blur-md shadow-lg border border-gray-100 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-pixel-100 flex items-center justify-center">
          <MapPin className="w-5 h-5 text-pixel-700" />
        </div>
        <div>
          <h3 className="text-lg font-bold">{province.name}</h3>
          <p className="text-xs text-gray-500">{province.nameEn}</p>
        </div>
      </div>

      {/* آمار خلاصه */}
      <div className="grid grid-cols-3 gap-2">
        <StatBox icon={Sprout} label="مساحت" value={`${province.totalArea.toLocaleString("fa-IR")} هکتار`} />
        <StatBox icon={Users} label="کشاورزان" value={province.farmerCount.toLocaleString("fa-IR")} />
        <StatBox icon={TrendingUp} label="تولید" value={`${(province.annualProduction / 1000).toLocaleString("fa-IR")}K تن`} />
      </div>

      {/* محصولات اصلی */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">محصولات اصلی</h4>
        <div className="flex flex-wrap gap-2">
          {province.mainCrops.map((crop) => (
            <span key={crop} className="px-2.5 py-1 text-xs rounded-full bg-pixel-100 text-pixel-700">
              {crop}
            </span>
          ))}
        </div>
      </div>

      {/* نمودار توزیع نوع کشت */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">توزیع نوع کشت</h4>
        <ResponsiveContainer width="100%" height={160}>
          <PieChart>
            <Pie data={farmTypeData} dataKey="value" nameKey="name"
              cx="50%" cy="50%" outerRadius={60} innerRadius={35} paddingAngle={2}>
              {farmTypeData.map((entry) => (
                <Cell key={entry.key} fill={FARM_TYPE_COLORS[entry.key]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-3 flex-wrap">
          {farmTypeData.map((entry) => (
            <div key={entry.key} className="flex items-center gap-1 text-xs">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: FARM_TYPE_COLORS[entry.key] }} />
              <span className="text-gray-600">{entry.name}: {entry.value}٪</span>
            </div>
          ))}
        </div>
      </div>

      {/* نمودار روند تولید */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">روند تولید ۵ سال (هزار تن)</h4>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={trendData}>
            <XAxis dataKey="year" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="value" fill="#15803d" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* شهرستان‌های برتر */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">شهرستان‌های برتر</h4>
        <div className="space-y-2">
          {[...province.counties].sort((a, b) => b.production - a.production).slice(0, 5).map((county, i) => (
            <motion.div
              key={county.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <span className="text-sm text-gray-700">{county.name}</span>
              <span className="text-xs text-gray-500">
                {(county.production / 1000).toLocaleString("fa-IR")}K تن
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatBox({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="p-2 rounded-lg bg-gray-50 border border-gray-100 text-center">
      <Icon className="w-4 h-4 text-pixel-600 mx-auto mb-1" />
      <div className="text-[10px] text-gray-500">{label}</div>
      <div className="text-xs font-bold text-gray-900">{value}</div>
    </div>
  );
}
```

### ۳-۵. پنل اطلاعات شهرستان (Level 2)

```typescript
// apps/web/src/app/identity/components/CountyPanel.tsx

"use client";

import { Sprout, Users, TrendingUp, MapPin, ArrowLeft } from "lucide-react";
import { getCounty, getProvince } from "../data/mock-data";
import Link from "next/link";
import { motion } from "framer-motion";

const FARM_TYPE_LABELS: Record<string, string> = {
  dryland: "دیمی", irrigated: "آبی", greenhouse: "گلخانه‌ای", orchard: "باغی",
};

export function CountyPanel({ provinceId, countyId }: { provinceId: string; countyId: string }) {
  const county = getCounty(provinceId, countyId);
  const province = getProvince(provinceId);
  if (!county || !province) return null;

  return (
    <div className="p-5 rounded-2xl bg-white/90 backdrop-blur-md shadow-lg border border-gray-100 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-pixel-100 flex items-center justify-center">
          <MapPin className="w-5 h-5 text-pixel-700" />
        </div>
        <div>
          <h3 className="text-lg font-bold">{county.name}</h3>
          <p className="text-xs text-gray-500">{province.name} — {county.nameEn}</p>
        </div>
      </div>

      {/* آمار */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={Sprout} label="مساحت زیر کشت" value={`${county.area.toLocaleString("fa-IR")} هکتار`} />
        <StatCard icon={Users} label="کشاورزان" value={county.farmers.toLocaleString("fa-IR")} />
        <StatCard icon={TrendingUp} label="تولید سالانه" value={`${county.production.toLocaleString("fa-IR")} تن`} />
        <StatCard icon={MapPin} label="نوع غالب" value={FARM_TYPE_LABELS[county.farmType] ?? county.farmType} />
      </div>

      {/* محصولات */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">محصولات اصلی</h4>
        <div className="flex flex-wrap gap-2">
          {county.crops.map((crop) => (
            <span key={crop} className="px-2.5 py-1 text-xs rounded-full bg-pixel-100 text-pixel-700">
              {crop}
            </span>
          ))}
        </div>
      </div>

      {/* کشاورزان ثبت‌شده */}
      <div className="p-4 rounded-xl bg-pixel-50 border border-pixel-100">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-pixel-800">کشاورزان ثبت‌شده</div>
            <div className="text-2xl font-bold text-pixel-700">
              {county.registeredFarmers.toLocaleString("fa-IR")} نفر
            </div>
          </div>
          <Users className="w-8 h-8 text-pixel-400" />
        </div>
      </div>

      {/* لینک به لیست کشاورزان */}
      <Link href={`/farmers?province=${province.name}&county=${county.name}`}>
        <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
          مشاهده کشاورزان این شهرستان
          <ArrowLeft className="w-4 h-4" />
        </button>
      </Link>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-3 rounded-xl bg-gray-50 border border-gray-100"
    >
      <Icon className="w-5 h-5 text-pixel-600 mb-2" />
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-sm font-bold text-gray-900">{value}</div>
    </motion.div>
  );
}
```

---

## مرحله ۴: صفحه Next.js

```typescript
// apps/web/src/app/identity/page.tsx

import InteractiveMap from "./components/InteractiveMap";
import { Metadata } from "next";
import Link from "next/link";
import { Sprout } from "lucide-react";

export const metadata: Metadata = {
  title: "شناسنامه کشاورزی — نقشه تعاملی ایران | پیکسل",
  description: "نقشه تعاملی کشاورزی ایران — اطلاعات تولید، محصولات و کشاورزان هر استان و شهرستان",
};

export default function IdentityPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pixel-50 via-white to-pixel-50">
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sprout className="h-7 w-7 text-pixel-700" />
              <div>
                <h1 className="text-lg font-bold text-gray-900">شناسنامه کشاورزی</h1>
                <p className="text-xs text-gray-500">نقشه تعاملی کشاورزی ایران</p>
              </div>
            </div>
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
              بازگشت به خانه
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="rounded-2xl bg-white/60 backdrop-blur-sm border border-gray-100 shadow-xl p-6">
          <InteractiveMap />
        </div>
      </main>
    </div>
  );
}
```

### ساختار فایل‌ها

```
apps/web/src/app/identity/
├── page.tsx                          → صفحه اصلی شناسنامه
├── components/
│   ├── InteractiveMap.tsx            → کامپوننت اصلی نقشه + drill-down
│   ├── MapBreadcrumb.tsx             → مسیر ناوبری (ایران › استان › شهرستان)
│   ├── CountryPanel.tsx              → پنل آمار کشور
│   ├── ProvincePanel.tsx             → پنل آمار استان + نمودارها
│   └── CountyPanel.tsx               → پنل آمار شهرستان + لینک کشاورزان
├── data/
│   └── mock-data.ts                  → دیتای mock ۳۱ استان و شهرستان‌ها
└── lib/
    └── types.ts                      → تایپ‌های ProvinceData و CountyData
```

---

## مرحله ۵: انیمیشن‌ها و تجربه بصری

### ۵-۱. انیمیشن‌های تعریف‌شده

| انیمیشن | موقعیت | مدت | easing |
|---|---|---|---|
| Fade In نقشه | ورود به هر سطح | 600ms | `easeInOut` |
| Fade Out نقشه | خروج از هر سطح | 600ms | `easeInOut` |
| Scale In نقشه | ورود استان | 600ms | `easeInOut` (0.9 → 1) |
| Slide In پنل | ورود اطلاعات | 400ms | `easeOut` (x: -20 → 0) |
| Slide Out پنل | خروج اطلاعات | 400ms | `easeOut` (x: 0 → 20) |
| Stagger آمار | ورود کارت‌های آمار | 100ms delay بین هر کارت | `easeOut` |
| Hover استان | hover روی نقشه | 200ms | `easeOut` (brightness 1.2) |
| Breadcrumb | تغییر سطح | 300ms | `easeOut` |

### ۵-۲. رنگ‌بندی نقشه

```typescript
// Gradient سبز کشاورزی بر اساس میزان تولید
const colorScale = {
  low: "#dcfce7",      // کم‌تولید
  medium: "#86efac",   // متوسط
  high: "#22c55e",     // پرتولید
  veryHigh: "#15803d", // بسیار پرتولید
};
const deactiveColor = "#f3f4f6"; // استان‌های بدون داده
```

### ۵-۳. افکت‌های بصری

- **Glassmorphism پنل:** `bg-white/90 backdrop-blur-md` + `shadow-lg`
- **هوور استان:** `brightness(1.2)` + سایه نرم + tooltip با نام و خلاصه
- **کلیک استان:** استان انتخاب‌شده به مرکز تصویر می‌آید + بقیه محو می‌شوند
- **Background:** `bg-gradient-to-b from-pixel-50 via-white to-pixel-50`
- **کارت نقشه:** `rounded-2xl bg-white/60 backdrop-blur-sm border shadow-xl`

### ۵-۴. Responsive

| دستگاه | رفتار |
|---|---|
| Desktop (lg+) | نقشه سمت راست، پنل سمت چپ (flex-row) |
| Tablet (md) | نقشه بالا، پنل پایین (flex-col) |
| Mobile (sm) | نقشه با pinch-to-zoom + پنل scrollable |

---

## مرحله ۶: اتصال به API (آینده — بعد از MVP)

### ۶-۱. tRPC Router

```typescript
// apps/api/src/trpc/routers/identity.ts

export const identityRouter = router({
  getCountryStats: publicProcedure.query(async ({ ctx }) => {
    // aggregate از جدول farmers + products
  }),

  getProvinceStats: publicProcedure
    .input(z.object({ provinceId: z.string() }))
    .query(async ({ ctx, input }) => {
      // aggregate از farmers WHERE province = ?
    }),

  getCountyStats: publicProcedure
    .input(z.object({ provinceId: z.string(), countyId: z.string() }))
    .query(async ({ ctx, input }) => {
      // aggregate از farmers WHERE province = ? AND county = ?
    }),

  listProvinces: publicProcedure.query(async ({ ctx }) => {
    // SELECT province, COUNT(*), SUM(total_area_hectares) FROM farmers GROUP BY province
  }),
});
```

### ۶-۲. کشینگ

| داده | استراتژی | TTL |
|---|---|---|
| آمار کشور | Redis | ۱ ساعت |
| آمار استان | Redis | ۳۰ دقیقه |
| آمار شهرستان | Redis | ۱۵ دقیقه |
| لیست استان‌ها | Redis | ۲۴ ساعت |

---

## مرحله ۷: تست‌های فاز ۶

### ۷-۱. تست‌های خودکار

```
identity-map.test.ts        — تست رندر نقشه + کلیک استان + drill-down
identity-animations.test.ts — تست AnimatePresence + transitions
identity-data.test.ts       — تست mock data + helper functions
identity-panel.test.ts      — تست پنل‌های اطلاعات + نمودارها
identity-responsive.test.ts — تست responsive breakpoints
```

### ۷-۲. تست‌های E2E

```
e2e/identity.spec.ts
  — باز کردن صفحه /identity
  — کلیک روی استان → بررسی fade in نقشه استان
  — بررسی نمایش آمار استان در پنل
  — کلیک روی شهرستان → بررسی نمایش آمار شهرستان
  — کلیک back → بررسی fade out و بازگشت به سطح قبلی
  — تست breadcrumb و مسیر ناوبری
  — تست responsive روی viewport موبایل
```

### ۷-۳. تست بصری

- بررسی انیمیشن‌های نرم روی Chrome + Firefox + Safari
- بررسی عملکرد روی موبایل (pinch-to-zoom)
- بررسی رنگ‌بندی نقشه (استان‌های پرتولید پررنگ‌تر)
- بررسی RTL کامل

### ۷-۴. چک‌لیست تأیید فاز ۶

- [ ] نقشه ایران با ۳۱ استان رندر می‌شود
- [ ] کلیک روی استان → fade in نقشه استان با انیمیشن نرم
- [ ] کلیک روی شهرستان → نمایش اطلاعات شهرستان
- [ ] Back button → fade out و بازگشت به سطح قبلی
- [ ] Breadcrumb مسیر صحیح نمایش می‌دهد
- [ ] پنل اطلاعات کشور با آمار کلی نمایش می‌شود
- [ ] پنل اطلاعات استان شامل نمودارها و محصولات است
- [ ] پنل اطلاعات شهرستان شامل آمار و لینک کشاورزان است
- [ ] انیمیشن‌ها روی تمام مرورگرها روان کار می‌کنند
- [ ] طراحی responsive روی موبایل و تبلت درست است
- [ ] رنگ‌بندی نقشه بر اساس دیتا صحیح است
- [ ] hover روی استان tooltip نمایش می‌دهد
- [ ] تمام testها pass می‌شوند

---

## خروجی نهایی فاز ۶

- نقشه تعاملی ایران با drill-down استان → شهرستان
- انیمیشن‌های نرم fade in/out با Framer Motion
- پنل اطلاعات با نمودارهای Recharts (Pie، Bar)
- Breadcrumb با دکمه بازگشت
- دیتای mock برای ۳۱ استان و شهرستان‌ها
- طراحی ملی و حرفه‌ای با glassmorphism
- کاملاً RTL و responsive
- آماده برای اتصال به API واقعی در فاز بعدی

---

## فاز بعدی (۷ — دیتای واقعی و بهینه‌سازی)

- جایگزینی mock data با داده‌های واقعی از دیتابیس (aggregate از جدول farmers)
- اتصال به tRPC router `identity`
- URL‌های shareable: `/identity/[province]/[county]`
- زیرساخت drill-down به بخش (district) — آماده اما غیرفعال
- بهینه‌سازی بارگذاری نقشه (lazy load TopoJSON)
- کشینگ Redis برای آمار
- اتصال به سامانه جهاد کشاورزی برای قیمت‌های رسمی
