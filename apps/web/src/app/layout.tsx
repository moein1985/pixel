import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import { TRPCProvider } from "@/components/TRPCProvider";

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  variable: "--font-vazirmatn",
  display: "swap",
});

export const metadata: Metadata = {
  title: "پیکسل — شناسنامه هوشمند کشاورزی",
  description: "پلتفرم ملی تحول دیجیتال در حوزه کشاورزی ایران",
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
