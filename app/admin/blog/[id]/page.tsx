import { notFound } from "next/navigation";
import BlogForm from "@/components/admin/BlogForm";
import { getBlog } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function EditBlogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getBlog(id);
  if (!post) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">EDIT POST</h1>
      <BlogForm initial={post} />
    </div>
  );
}
