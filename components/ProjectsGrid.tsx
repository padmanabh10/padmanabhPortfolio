"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/lib/types";

export default function ProjectsGrid({ projects }: { projects: Project[] }) {
  const categories = useMemo(() => {
    const unique = [...new Set(projects.map((p) => p.category).filter(Boolean))];
    unique.sort();
    return unique;
  }, [projects]);

  const filters = useMemo(() => ["ALL FILES", ...categories], [categories]);

  const [active, setActive] = useState("ALL FILES");

  const filtered =
    active === "ALL FILES"
      ? projects
      : projects.filter((p) => p.category === active);

  return (
    <>
      <section className="px-4 sm:px-8 md:px-24 py-6 flex flex-wrap items-center justify-between gap-4 border-y border-border">
        <div className="flex gap-2 flex-wrap">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActive(f)}
              className={`font-mono text-xs font-bold tracking-wider px-4 py-2 transition-colors ${
                active === f
                  ? "bg-primary text-white"
                  : "bg-surface text-text-secondary hover:bg-primary/10"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <span className="font-mono text-xs text-text-muted">
          FILTERED RESULTS: {filtered.length}
        </span>
      </section>

      <section className="px-4 sm:px-8 md:px-24 pb-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {filtered.length === 0 && (
          <p className="font-mono text-xs text-text-muted col-span-full py-12 text-center">
            No projects yet.
          </p>
        )}
        {filtered.map((project) => (
          <article
            key={project._id}
            className="bg-bg-card border border-border group"
          >
            <div className="relative h-48 overflow-hidden bg-surface">
              {project.coverUrl && (
                <Image
                  src={project.coverUrl}
                  alt={project.title}
                  fill
                  className="object-cover object-top transition-transform group-hover:scale-105"
                  sizes="(min-width: 768px) 33vw, 100vw"
                  unoptimized={project.coverUrl.startsWith("http")}
                />
              )}
            </div>
            <div className="p-6">
              <h3 className="font-heading text-2xl uppercase text-text">
                {project.title}
              </h3>
              <p className="font-mono text-xs text-text-secondary mt-2 leading-relaxed line-clamp-3">
                {project.description}
              </p>
              <div className="flex gap-2 mt-3 flex-wrap">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-primary text-white font-mono text-[10px] font-bold px-3 py-1"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <Link
                href={`/projects/${project.slug}`}
                className="mt-4 w-full border border-primary text-primary font-mono text-xs font-bold tracking-wider py-2 hover:bg-primary hover:text-white transition-colors block text-center"
              >
                &gt; VIEW PROJECT
              </Link>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
