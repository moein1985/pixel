"use client";

import { Card, CardContent, Button, Input, Textarea, Badge } from "@pixel/ui";
import { Send, Users, MessageSquare } from "lucide-react";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function NetworkDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: network } = trpc.network.get.useQuery({ id });
  const { data: posts } = trpc.network.getPosts.useQuery({ networkId: id, page: 1, pageSize: 20 });
  const createPost = trpc.network.createPost.useMutation();
  const joinNetwork = trpc.network.join.useMutation();

  const [postContent, setPostContent] = useState("");

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) return;
    createPost.mutate({ networkId: id, content: postContent }, {
      onSuccess: () => setPostContent(""),
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-bold text-pixel-700">پیکسل</Link>
          <Link href="/networks"><Button variant="ghost" size="sm">شبکه‌ها</Button></Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-8">
        {network && (
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">{network.name}</h1>
                {network.description && <p className="text-gray-600 mt-1">{network.description}</p>}
                <div className="flex items-center gap-3 mt-2 text-sm text-gray-400">
                  <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {network.memberCount} عضو</span>
                  {network.province && <Badge variant="info">{network.province}</Badge>}
                  <Badge>{network.networkType}</Badge>
                </div>
              </div>
              <Button onClick={() => joinNetwork.mutate({ networkId: id })} disabled={joinNetwork.isLoading}>
                عضویت
              </Button>
            </div>
          </div>
        )}

        <Card className="mb-6">
          <CardContent>
            <form onSubmit={handlePost} className="space-y-3">
              <Textarea value={postContent} onChange={(e) => setPostContent(e.target.value)} placeholder="مطلب خود را به اشتراک بگذارید..." />
              <Button type="submit" size="sm" disabled={createPost.isLoading}>
                <Send className="ml-1 h-4 w-4" /> انتشار
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {posts?.items.map((post: any) => (
            <Card key={post.id}>
              <CardContent>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-pixel-100 flex items-center justify-center text-pixel-700 text-sm font-bold">
                    {post.authorFirstName?.[0] ?? "؟"}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{post.authorFirstName} {post.authorLastName}</p>
                    <p className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleDateString("fa-IR")}</p>
                  </div>
                </div>
                <p className="text-gray-700">{post.content}</p>
                {post.images && post.images.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {post.images.map((img: string, i: number) => (
                      <img key={i} src={img} alt="" className="rounded-lg w-full h-32 object-cover" />
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                  <span className="flex items-center gap-1"><MessageSquare className="h-4 w-4" /> {post.commentCount} نظر</span>
                </div>
              </CardContent>
            </Card>
          ))}
          {!posts?.items?.length && (
            <div className="text-center py-8 text-gray-400">هنوز مطلبی منتشر نشده</div>
          )}
        </div>
      </div>
    </div>
  );
}
