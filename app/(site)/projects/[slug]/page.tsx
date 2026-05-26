import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  return (
    <article className="px-4 sm:px-8 md:px-24 pt-12 sm:pt-16 pb-24 max-w-4xl mx-auto">
      <Link
        href="/projects"
        className="font-mono text-xs text-text-muted hover:text-primary"
      >
        &larr; BACK TO PROJECTS
      </Link>

      <header className="mt-6 mb-10">
        <div className="flex gap-2 mb-6 flex-wrap">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="bg-primary text-white font-mono text-[10px] font-bold px-3 py-1"
            >
              {tag}
            </span>
          ))}
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl md:text-6xl uppercase text-text leading-tight">
          {project.title}
        </h1>
        <p className="font-mono text-sm text-text-secondary mt-4">
          {project.description}
        </p>
        {project.category && (
          <span className="font-mono text-[10px] font-bold text-text-muted mt-6 block">
            CATEGORY: {project.category.toUpperCase()}
          </span>
        )}
      </header>

      {project.coverUrl && (
        <div className="relative w-full aspect-[16/9] mb-10 bg-surface">
          <Image
            src={project.coverUrl}
            alt={project.title}
            fill
            className="object-cover object-top"
            sizes="(min-width: 768px) 768px, 100vw"
            unoptimized={project.coverUrl.startsWith("http")}
          />
        </div>
      )}

      {project.content ? (
        <div
          className="blog-content font-mono text-sm text-text leading-relaxed"
          dangerouslySetInnerHTML={{ __html: project.content }}
        />
      ) : (
        <p className="font-mono text-xs text-text-muted">No content yet.</p>
      )}
    </article>
  );
}
