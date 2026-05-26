import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/lib/types";

const arrowIcon = "/images/right-arrow.png";

export default function ProjectsSection({
  projects,
}: {
  projects: Project[];
}) {
  if (projects.length === 0) return null;

  return (
    <section className="bg-bg-alt px-4 sm:px-8 md:px-24 py-12 sm:py-24">
      {/* Section header */}
      <div className="flex items-center gap-4 sm:gap-6 mb-8 sm:mb-16">
        <h2 className="font-heading text-3xl sm:text-5xl uppercase text-primary whitespace-nowrap">
          FEATURED PROJECTS
        </h2>
        <div className="flex-1 h-0.5 bg-primary/30 hidden md:block" />
        <Link
          href="/projects"
          aria-label="View all projects"
          className="group shrink-0 inline-flex items-center justify-center w-12 h-12 border border-primary text-primary hover:bg-primary hover:text-tag-text transition-colors"
        >
          <Image src={arrowIcon} alt="→" width={16} height={16} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Bento grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1">
        {/* Large card — first project */}
        {projects[0] && (
          <Link
            href={`/projects/${projects[0].slug}`}
            className="md:col-span-2 bg-bg-card p-1 group"
          >
            <div className="bg-bg-card p-6 sm:p-8 flex flex-col justify-between h-full min-h-[320px] sm:min-h-[460px]">
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-heading text-2xl sm:text-4xl uppercase text-text">
                      {projects[0].title}
                    </h3>
                    <p className="font-mono text-sm text-text-secondary mt-2">
                      {projects[0].description}
                    </p>
                  </div>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="text-primary mt-2 shrink-0"
                  >
                    <path
                      d="M7 17L17 7M17 7H7M17 7V17"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
              </div>
              <div className="mt-8">
                {projects[0].coverUrl && (
                  <div className="relative w-full h-64 overflow-hidden">
                    <Image
                      src={projects[0].coverUrl}
                      alt={projects[0].title}
                      fill
                      className="object-cover object-top"
                      sizes="(min-width: 768px) 66vw, 100vw"
                      unoptimized={projects[0].coverUrl.startsWith("http")}
                    />
                  </div>
                )}
                <div className="flex gap-2 mt-4">
                  {projects[0].tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-primary text-white font-mono text-[10px] font-bold px-3 py-1"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Small card — second project */}
        {projects[1] && (
          <Link
            href={`/projects/${projects[1].slug}`}
            className="bg-bg-card p-1 group"
          >
            <div className="bg-bg-card p-6 sm:p-8 flex flex-col justify-between h-full min-h-[320px] sm:min-h-[460px]">
              <div>
                <h3 className="font-heading text-2xl sm:text-3xl uppercase text-text">
                  {projects[1].title}
                </h3>
                <p className="font-mono text-sm text-text-secondary mt-3 leading-relaxed">
                  {projects[1].description}
                </p>
              </div>
              <div className="mt-auto pt-6">
                {projects[1].coverUrl && (
                  <div className="relative w-full h-40 overflow-hidden mb-4">
                    <Image
                      src={projects[1].coverUrl}
                      alt={projects[1].title}
                      fill
                      className="object-cover object-top"
                      sizes="(min-width: 768px) 33vw, 100vw"
                      unoptimized={projects[1].coverUrl.startsWith("http")}
                    />
                  </div>
                )}
                <div className="flex gap-2">
                  {projects[1].tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-primary text-white font-mono text-[10px] font-bold px-3 py-1"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="font-mono text-xs text-primary mt-4 font-bold tracking-wider">
                  VIEW DETAILS
                </p>
              </div>
            </div>
          </Link>
        )}

        {/* Medium card — third project */}
        {projects[2] && (
          <Link
            href={`/projects/${projects[2].slug}`}
            className="sm:col-span-2 md:col-span-3 bg-bg-card p-1 group"
          >
            <div className="bg-bg-card p-6 sm:p-8">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 sm:gap-8">
                <div className="max-w-lg">
                  <h3 className="font-heading text-2xl sm:text-4xl uppercase text-text">
                    {projects[2].title}
                  </h3>
                  <p className="font-mono text-sm text-text-secondary mt-3 leading-relaxed">
                    {projects[2].description}
                  </p>
                  <div className="flex gap-2 mt-4">
                    {projects[2].tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-primary text-white font-mono text-[10px] font-bold px-3 py-1"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="font-mono text-xs text-primary mt-4 font-bold tracking-wider">
                    VIEW DETAILS
                  </p>
                </div>
                {projects[2].coverUrl && (
                  <div className="relative w-full md:w-80 h-48 overflow-hidden shrink-0">
                    <Image
                      src={projects[2].coverUrl}
                      alt={projects[2].title}
                      fill
                      className="object-cover object-top"
                      sizes="(min-width: 768px) 320px, 100vw"
                      unoptimized={projects[2].coverUrl.startsWith("http")}
                    />
                  </div>
                )}
              </div>
            </div>
          </Link>
        )}
      </div>
    </section>
  );
}
