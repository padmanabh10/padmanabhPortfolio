import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getBlogs } from "@/lib/api";

export const metadata: Metadata = { title: "Blog" };
import type { BlogPost } from "@/lib/types";
import NewsletterForm from "@/components/NewsletterForm";
import PageHeader from "@/components/PageHeader";

function formatDate(iso: string) {
  const d = new Date(iso);
  return d
    .toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    .toUpperCase()
    .replace(/ /g, " ");
}

function Cover({ src, alt }: { src: string; alt: string }) {
  if (!src) return null;
  return (
    <Image
      src={src}
      alt={alt}
      fill
      className="object-cover object-top"
      sizes="(min-width: 768px) 50vw, 100vw"
      unoptimized={src.startsWith("http")}
    />
  );
}

export default async function BlogPage() {
  const posts = await getBlogs();
  const [featured, ...rest] = posts;
  const recent = rest.slice(0, 6);

  return (
    <>
      <PageHeader>
        <h1 className="font-heading text-4xl sm:text-6xl md:text-8xl uppercase text-text leading-none">
          PERSONAL
          <br />
          BLOGS
        </h1>
        <p className="font-mono text-sm text-text-secondary mt-4 max-w-2xl">
          Personal reflections and technical deep-dives into system design,
          software architecture, and the lessons learned along the way.
        </p>
      </PageHeader>

      {featured ? (
        <FeaturedPost post={featured} />
      ) : (
        <p className="px-8 md:px-24 pb-16 font-mono text-xs text-text-muted">
          No Blogs yet.
        </p>
      )}

      {recent.length > 0 && (
        <section className="px-4 sm:px-8 md:px-24 pb-16">
          <div className="flex items-center gap-4 sm:gap-6 mb-8">
            <h2 className="font-heading text-3xl uppercase text-text whitespace-nowrap">
              RECENT BLOGS
            </h2>
            <div className="flex-1 h-px bg-border hidden md:block" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {recent.map((article) => (
              <Link
                key={article._id}
                href={`/blog/${article.slug}`}
                className="bg-bg-card border border-border group block"
              >
                <div className="relative h-48 overflow-hidden bg-surface">
                  <Cover src={article.coverUrl} alt={article.title} />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-3">
                    <span className="font-mono text-[10px] font-bold text-text-muted">
                      DATE: {formatDate(article.createdAt)}
                    </span>
                  </div>
                  <h3 className="font-mono text-base font-medium text-text leading-snug">
                    {article.title}
                  </h3>
                  <div className="flex items-center justify-between mt-4">
                    <span className="font-mono text-[10px] font-bold text-text-muted">
                      {article.readTime}
                    </span>
                    <Image src="/images/right-arrow.png" alt="→" width={12} height={12} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mx-4 sm:mx-8 md:mx-24 mb-16 bg-primary p-6 sm:p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div>
          <h2 className="font-heading text-4xl md:text-5xl text-white uppercase">
            STAY IN THE LOOP
          </h2>
          <p className="font-mono text-sm text-white/70 mt-2 max-w-lg">
            Subscribe for personal stories, technical deep-dives, and
            everything I learn building things that matter.
          </p>
        </div>
        <NewsletterForm />
      </section>
    </>
  );
}

function FeaturedPost({ post }: { post: BlogPost }) {
  return (
    <section className="px-4 sm:px-8 md:px-24 pb-16">
      <Link
        href={`/blog/${post.slug}`}
        className="block bg-bg-card border border-border overflow-hidden"
      >
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="p-8 md:p-12 flex flex-col justify-between">
            <div>
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
              <h2 className="font-mono text-2xl md:text-3xl text-text font-medium leading-tight">
                {post.title}
              </h2>
              <p className="font-mono text-sm text-text-secondary mt-4 leading-relaxed">
                {post.excerpt}
              </p>
            </div>
            <div className="flex items-center gap-6 mt-8">
              <span className="font-mono text-[10px] font-bold text-text-muted">
                DATE: {formatDate(post.createdAt)}
              </span>
              <span className="font-mono text-[10px] font-bold text-text-muted">
                {post.readTime}
              </span>
              <span className="font-mono text-xs font-bold text-primary tracking-wider hover:underline">
                READ BLOG
              </span>
            </div>
          </div>
          <div className="relative h-64 md:h-auto bg-surface">
            <Cover src={post.coverUrl} alt={post.title} />
          </div>
        </div>
      </Link>
    </section>
  );
}
