"use client";

import { Card, CardContent, Badge, Button, Input, Textarea, Label } from "@pixel/ui";
import { Users, MapPin, Plus, MessageSquare, Heart, Send } from "lucide-react";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

export default function NetworksPage() {
  const { data, isLoading } = trpc.network.list.useQuery({ page: 1, pageSize: 20 });
  const createNetwork = trpc.network.create.useMutation();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [province, setProvince] = useState("");
  const [networkType, setNetworkType] = useState("general");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createNetwork.mutate({
      name,
      description: description || undefined,
      province: province || undefined,
      networkType: networkType as any,
    }, {
      onSuccess: () => { setShowForm(false); setName(""); setDescription(""); },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-bold text-pixel-700">پیکسل</Link>
          <div className="flex items-center gap-3">
            <Link href="/login"><Button variant="ghost" size="sm">ورود</Button></Link>
            <Button size="sm" onClick={() => setShowForm(!showForm)}>
              <Plus className="ml-1 h-4 w-4" /> شبکه جدید
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">شبکه‌های کشاورزی</h1>

        {showForm && (
          <Card className="mb-6">
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <Label>نام شبکه *</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div>
                  <Label>توضیحات</Label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>استان</Label>
                    <Input value={province} onChange={(e) => setProvince(e.target.value)} />
                  </div>
                  <div>
                    <Label>نوع شبکه</Label>
                    <select value={networkType} onChange={(e) => setNetworkType(e.target.value)} className="w-full rounded-md border px-3 py-2">
                      <option value="general">عمومی</option>
                      <option value="regional">منطقه‌ای</option>
                      <option value="crop_based">محصولی</option>
                      <option value="cooperative">تعاونی</option>
                    </select>
                  </div>
                </div>
                <Button type="submit" disabled={createNetwork.isLoading}>ایجاد شبکه</Button>
              </form>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">در حال بارگذاری...</div>
        ) : data && data.items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.items.map((network: any) => (
              <Link key={network.id} href={`/networks/${network.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardContent>
                    <div className="flex items-start justify-between">
                      <Users className="h-8 w-8 text-pixel-600" />
                      <Badge variant="info">{network.networkType}</Badge>
                    </div>
                    <h3 className="font-bold mt-3">{network.name}</h3>
                    {network.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{network.description}</p>}
                    <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {network.memberCount} عضو</span>
                      {network.province && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {network.province}</span>}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">شبکه‌ای یافت نشد</div>
        )}
      </div>
    </div>
  );
}
