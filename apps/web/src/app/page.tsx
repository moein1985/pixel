import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from "@pixel/ui";
import { Sprout, Store, Building2, Truck, Search, MessageSquare } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <Sprout className="h-8 w-8 text-pixel-700" />
            <span className="text-xl font-bold text-gray-900">پیکسل</span>
            <span className="hidden text-sm text-gray-500 sm:inline">شناسنامه هوشمند کشاورزی</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm">ورود</Button>
            <Button size="sm">ثبت‌نام</Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-pixel-50 to-white py-20">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
            پلتفرم ملی تحول دیجیتال در کشاورزی
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            شناسنامه هوشمند کشاورزی، بازار هوشمند B2B، و خدمات مبتنی بر هوش مصنوعی برای کشاورزان، تأمین‌کنندگان و شرکت‌های کشاورزی ایران
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button size="lg">شروع کنید</Button>
            <Button size="lg" variant="outline">بیشتر بدانید</Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <Sprout className="h-10 w-10 text-pixel-600" />
              <CardTitle className="mt-2">شناسنامه کشاورزی</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                ایجاد پروفایل هوشمند برای کشاورزان، تأمین‌کنندگان و شرکت‌ها با تأیید هویت و رتبه‌بندی اعتباری
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Store className="h-10 w-10 text-pixel-600" />
              <CardTitle className="mt-2">بازار هوشمند</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                بازار B2B کشاورزی با جستجوی پیشرفته، درخواست خرید (RFQ)، سیستم سفارش و پرداخت آنلاین
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Building2 className="h-10 w-10 text-pixel-600" />
              <CardTitle className="mt-2">مدیریت زنجیره تأمین</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                مدیریت کامل زنجیره تأمین از تأمین‌کننده تا مصرف‌کننده با ردیابی محموله و لجستیک
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Search className="h-10 w-10 text-pixel-600" />
              <CardTitle className="mt-2">هوش مصنوعی</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                چت‌بات هوشمند فارسی، پیش‌بینی قیمت، تشخیص آفت و بیماری گیاهی از تصویر
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <MessageSquare className="h-10 w-10 text-pixel-600" />
              <CardTitle className="mt-2">شبکه ارتباطی</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                شبکه‌های ارتباطی کشاورزان برای اشتراک دانش و تجربه، با چت real-time
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Truck className="h-10 w-10 text-pixel-600" />
              <CardTitle className="mt-2">گزارش بازار</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                گزارش‌های تحلیلی بازار کشاورزی، نمودار قیمت‌ها، و پیش‌بینی روندها
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-pixel-700 py-12">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 text-center text-white md:grid-cols-4">
          <div>
            <div className="text-3xl font-bold">۳۱</div>
            <div className="text-sm text-pixel-100">استان پوشش‌شده</div>
          </div>
          <div>
            <div className="text-3xl font-bold">۸+</div>
            <div className="text-sm text-pixel-100">دسته‌بندی محصول</div>
          </div>
          <div>
            <div className="text-3xl font-bold">۴</div>
            <div className="text-sm text-pixel-100">نقش کاربری</div>
          </div>
          <div>
            <div className="text-3xl font-bold">۲۴/۷</div>
            <div className="text-sm text-pixel-100">پشتیبانی آنلاین</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-500">
          <p>پیکسل — شناسنامه هوشمند کشاورزی © ۲۰۲۶</p>
        </div>
      </footer>
    </div>
  );
}
