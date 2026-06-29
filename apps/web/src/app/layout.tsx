import type { Metadata, Viewport } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import { TRPCProvider } from "@/components/TRPCProvider";

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  variable: "--font-vazirmatn",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "پیکسل — شناسانه هوشمند کشاورزی",
    template: "%s | پیکسل",
  },
  description: "پلتفرم ملی تحول دیجیتال در حوزه کشاورزی ایران — بازار هوشمند B2B، هوش مصنوعی، گزارش بازار",
  keywords: ["کشاورزی", "بازار کشاورزی", "تأمین‌کننده", "B2B", "هوش مصنوعی", "پیکسل", "ایران"],
  authors: [{ name: "Pixel Team" }],
  manifest: "/manifest.json",
  alternates: {
    canonical: "https://pixel.ir",
  },
  openGraph: {
    title: "پیکسل — شناسانه هوشمند کشاورزی",
    description: "پلتفرم ملی تحول دیجیتال در حوزه کشاورزی ایران",
    siteName: "پیکسل",
    locale: "fa_IR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "پیکسل — شناسانه هوشمند کشاورزی",
    description: "پلتفرم ملی تحول دیجیتال در حوزه کشاورزی ایران",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#15803d",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" className={vazirmatn.variable}>
      <body className="font-sans">
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  );
}
