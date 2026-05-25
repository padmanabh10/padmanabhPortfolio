import Image from "next/image";
import Link from "next/link";
import type { BlogPost } from "@/lib/types";

const arrowIcon = "/images/right-arrow.png";

function formatDate(iso: string) {
  const d = new Date(iso);
  return d
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .toUpperCase()
    .replace(/ /g, " ");
}

export default function FormationSpecs({ blogs }: { blogs: BlogPost[] }) {
  if (blogs.length === 0) return null;

  return (
    <section className="px-8 md:px-24 py-24 border-t border-border">
      <div className="flex items-center gap-6 mb-16">
        <h2 className="font-heading text-5xl uppercase text-primary whitespace-nowrap">
          FEATURED BLOGS
        </h2>
        <div className="flex-1 h-0.5 bg-primary/30 hidden md:block" />
        <Link
          href="/blog"
          aria-label="View all blogs"
          className="group shrink-0 inline-flex items-center justify-center w-12 h-12 border border-primary text-primary hover:bg-primary hover:text-tag-text transition-colors"
        >
          <Image src={arrowIcon} alt="→" width={16} height={16} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <ul className={`grid grid-cols-1 gap-px bg-border ${
        blogs.length === 1 ? "md:grid-cols-1" : blogs.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3"
      }`}>
        {blogs.map((post) => (
          <li key={post._id} className="bg-bg">
            <Link
              href={`/blog/${post.slug}`}
              className="group flex flex-col h-full transition-colors hover:bg-surface"
            >
              {post.coverUrl && (
                <div className="relative w-full h-48 overflow-hidden">
                  <Image
                    src={post.coverUrl}
                    alt={post.title}
                    fill
                    className="object-cover object-top"
                    sizes="(min-width: 768px) 33vw, 100vw"
                    unoptimized={post.coverUrl.startsWith("http")}
                  />
                </div>
              )}
              <div className="flex flex-col flex-1 p-8">
                <div className="flex items-center gap-3 mb-6">
                  {post.tags[0] && (
                    <span className="bg-primary text-white font-mono text-[10px] font-bold px-2 py-0.5 tracking-wider">
                      {post.tags[0]}
                    </span>
                  )}
                  <span className="font-mono text-[10px] font-bold text-text-muted">
                    {formatDate(post.createdAt)}
                  </span>
                </div>
                <h3 className="font-mono text-xl text-text font-medium leading-snug group-hover:text-primary transition-colors flex-1">
                  {post.title}
                </h3>
                <div className="flex items-center justify-between mt-8">
                  <span className="font-mono text-[10px] font-bold text-text-muted">
                    {post.readTime}
                  </span>
                  <Image src={arrowIcon} alt="→" width={12} height={12} />
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
