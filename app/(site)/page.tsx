import type { Metadata } from "next";
import HeroSection from "@/components/HeroSection";

export const metadata: Metadata = { title: "Home" };
import ProjectsSection from "@/components/ProjectsSection";
import FormationSpecs from "@/components/FormationSpecs";
import { getProjects, getBlogs } from "@/lib/api";

export default async function Home() {
  const [allProjects, allBlogs] = await Promise.all([
    getProjects(),
    getBlogs(),
  ]);

  const featuredProjects = allProjects
    .filter((p) => p.featured)
    .slice(0, 3);

  const latestBlogs = allBlogs.slice(0, 3);

  return (
    <>
      <HeroSection />
      <ProjectsSection projects={featuredProjects} />
      <FormationSpecs blogs={latestBlogs} />
    </>
  );
}
