import { NotConfigured } from "@/components/admin/NotConfigured";
import { ProjectsManager } from "@/components/admin/ProjectsManager";
import { adminListProjects } from "@/lib/admin";
import type { Project } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminProyectosPage() {
  let projects: Project[] = [];
  let error: string | null = null;

  try {
    projects = await adminListProjects();
  } catch (err) {
    error = err instanceof Error ? err.message : "Error desconocido";
  }

  if (error) {
    return <NotConfigured title="No se pudo leer la tabla de proyectos" reason={error} />;
  }

  return <ProjectsManager projects={projects} />;
}
