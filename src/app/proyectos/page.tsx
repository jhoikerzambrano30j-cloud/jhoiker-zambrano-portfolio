import type { Metadata } from "next";
import { SectionHeading, Stat } from "@/components/ui/Primitives";
import { ProjectsExplorer } from "@/components/sections/ProjectsExplorer";
import { CtaBand } from "@/components/sections/CtaBand";
import { PageHeader } from "@/components/sections/PageHeader";
import { getProjects } from "@/lib/data";

export const metadata: Metadata = {
  title: "Proyectos",
  description:
    "Portafolio de Jhoiker Zambrano: plataformas web, portales de búsqueda, paneles de datos, e-commerce, sistemas de diseño e infraestructura en producción.",
};

export const revalidate = 300;

export default async function ProyectosPage() {
  const projects = await getProjects();

  const categories = new Set(projects.map((p) => p.category));
  const withMetrics = projects.filter((p) => p.metrics.length > 0).length;

  return (
    <>
      <PageHeader
        eyebrow="Portafolio"
        title="Proyectos que"
        highlight="están en producción"
        description="No es una lista de ejercicios. Son páginas y aplicaciones que operan todos los días, con decisiones de diseño detrás de cada pantalla y resultados medibles."
        breadcrumb={[{ label: "Inicio", href: "/" }, { label: "Proyectos" }]}
      />

      <section className="pb-16">
        <div className="brand-container">
          {/* Métricas del portafolio */}
          <div className="mb-12 grid grid-cols-2 gap-6 border-y border-white/[0.07] py-8 sm:grid-cols-4">
            <Stat value={projects.length} suffix="" label="Proyectos publicados" />
            <Stat value={categories.size} label="Categorías" />
            <Stat value={withMetrics} label="Con métricas reales" />
            <Stat value="100" suffix="%" label="Entregados" />
          </div>

          <ProjectsExplorer projects={projects} />
        </div>
      </section>

      <div className="brand-container pb-4">
        <SectionHeading
          eyebrow="Transparencia"
          title="Cada proyecto con"
          highlight="su contexto"
          description="Entra a cualquier caso para ver el problema, la solución, el stack y los resultados medibles."
          align="center"
        />
      </div>

      <CtaBand
        title="¿Quieres algo"
        highlight="así para ti?"
        description="Cuéntame tu caso y te digo con honestidad si puedo ayudarte, cuánto costaría y en cuánto tiempo."
      />
    </>
  );
}
