import { notFound } from "next/navigation";
import ProjectForm from "@/components/admin/ProjectForm";
import { getProject } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">EDIT PROJECT</h1>
      <ProjectForm initial={project} />
    </div>
  );
}
