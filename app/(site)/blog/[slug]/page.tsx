import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlog } from "@/lib/api";

export const dynamic = "force-dynamic";

function formatDate(iso: string) {
  const d = new Date(iso);
  return d
    .toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    .toUpperCase()
    .replace(/ /g, " ");
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlog(slug);
  if (!post || !post.published) notFound();

  return (
    <article className="px-8 md:px-24 pt-16 pb-24 max-w-4xl mx-auto">
      <Link
        href="/blog"
        className="font-mono text-xs text-text-muted hover:text-primary"
      >
        ← BACK TO BLOG
      </Link>

      <header className="mt-6 mb-10">
        <div className="flex gap-2 mb-6 flex-wrap">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="bg-primary text-white font-mono text-[10px] font-bold px-3 py-1"
            >
              {tag}
            </span>
          ))}
        </div>
        <h1 className="font-heading text-4xl md:text-6xl uppercase text-text leading-tight">
          {post.title}
        </h1>
        <p className="font-mono text-sm text-text-secondary mt-4">
          {post.excerpt}
        </p>
        <div className="flex items-center gap-6 mt-6">
          <span className="font-mono text-[10px] font-bold text-text-muted">
            DATE: {formatDate(post.createdAt)}
          </span>
          <span className="font-mono text-[10px] font-bold text-text-muted">
            {post.readTime}
          </span>
        </div>
      </header>

      {post.coverUrl && (
        <div className="relative w-full aspect-[16/9] mb-10 bg-surface">
          <Image
            src={post.coverUrl}
            alt={post.title}
            fill
            className="object-cover object-top"
            sizes="(min-width: 768px) 768px, 100vw"
            unoptimized={post.coverUrl.startsWith("http")}
          />
        </div>
      )}

      {post.content ? (
        <div
          className="blog-content font-mono text-sm text-text leading-relaxed"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      ) : (
        <p className="font-mono text-xs text-text-muted">no body content</p>
      )}
    </article>
  );
}
