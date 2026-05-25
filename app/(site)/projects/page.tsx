import type { Metadata } from "next";
import ProjectsGrid from "@/components/ProjectsGrid";
import { getProjects } from "@/lib/api";

export const metadata: Metadata = { title: "Projects" };

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <>
      <section className="px-8 md:px-24 pt-16 pb-12">
        <h1 className="font-heading text-6xl md:text-8xl uppercase text-text leading-none">
          PROJECT
          <br />
          ARCHIVE
        </h1>
        <p className="font-mono text-sm text-text-secondary mt-4 max-w-2xl">
          A collection of my engineering projects spanning backend systems,
          infrastructure, and full-stack applications.
        </p>
      </section>

      <ProjectsGrid projects={projects} />
    </>
  );
}
