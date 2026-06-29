"use client";

import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from "@pixel/ui";
import { Package, ShoppingCart, MessageSquare, Star } from "lucide-react";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import { useParams } from "next/navigation";

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: product, isLoading } = trpc.product.get.useQuery({ id });
  const { data: reviews } = trpc.review.list.useQuery({
    revieweeType: "product",
    revieweeId: id,
    page: 1,
    pageSize: 10,
  });

  if (isLoading) return <div className="text-center py-12 text-gray-500">در حال بارگذاری...</div>;
  if (!product) return <div className="text-center py-12 text-gray-500">محصول یافت نشد</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-bold text-pixel-700">پیکسل</Link>
          <div className="flex items-center gap-3">
            <Link href="/market"><Button variant="ghost" size="sm">بازار</Button></Link>
            <Link href="/login"><Button variant="ghost" size="sm">ورود</Button></Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            {product.images?.[0] ? (
              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Package className="h-24 w-24 text-gray-300" />
              </div>
            )}
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
            <Link href={`/suppliers/${product.supplierId}`} className="text-pixel-600 hover:underline mt-1 block">
              {product.supplierName}
            </Link>
            {product.supplierProvince && <p className="text-sm text-gray-500 mt-1">{product.supplierProvince}</p>}

            <div className="mt-4">
              {product.pricePerUnit ? (
                <span className="text-2xl font-bold text-pixel-700">
                  {Number(product.pricePerUnit).toLocaleString("fa-IR")} تومان / {product.unit}
                </span>
              ) : (
                <span className="text-gray-400">برای استعلام قیمت با تأمین‌کننده تماس بگیرید</span>
              )}
            </div>

            {product.stockStatus && (
              <div className="mt-2">
                <Badge variant={product.stockStatus === "in_stock" ? "success" : product.stockStatus === "low_stock" ? "warning" : "error"}>
                  {product.stockStatus === "in_stock" ? "موجود" : product.stockStatus === "low_stock" ? "موجودی محدود" : "ناموجود"}
                </Badge>
              </div>
            )}

            {product.description && (
              <p className="mt-4 text-gray-600">{product.description}</p>
            )}

            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <Card className="mt-4">
                <CardHeader><CardTitle>مشخصات</CardTitle></CardHeader>
                <CardContent>
                  <dl className="space-y-2">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <dt className="text-gray-500">{key}</dt>
                        <dd className="font-medium">{String(value)}</dd>
                      </div>
                    ))}
                  </dl>
                </CardContent>
              </Card>
            )}

            {product.brand && <p className="mt-2 text-sm text-gray-500">برند: {product.brand}</p>}
            {product.origin && <p className="text-sm text-gray-500">مبدا: {product.origin}</p>}

            <div className="mt-6 flex gap-3">
              <Link href="/login"><Button size="lg"><ShoppingCart className="ml-2 h-5 w-5" /> ثبت سفارش</Button></Link>
              <Link href="/login"><Button size="lg" variant="outline"><MessageSquare className="ml-2 h-5 w-5" /> چت با تأمین‌کننده</Button></Link>
            </div>
          </div>
        </div>

        {reviews && reviews.items.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold mb-4">ارزیابی‌ها</h2>
            <div className="space-y-4">
              {reviews.items.map((review: any) => (
                <Card key={review.id}>
                  <CardContent>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
                        ))}
                      </div>
                    </div>
                    {review.comment && <p className="text-gray-600">{review.comment}</p>}
                    {review.reply && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">پاسخ تأمین‌کننده:</p>
                        <p className="text-gray-700">{review.reply}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
