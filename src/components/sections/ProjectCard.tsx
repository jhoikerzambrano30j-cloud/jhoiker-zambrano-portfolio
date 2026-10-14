import Link from "next/link";
import { ArrowUpRight, Calendar, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/Primitives";
import { ProjectVisual } from "./ProjectVisual";
import type { Project } from "@/lib/types";

/** Tarjeta de proyecto con visual de marca generado. */
export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/proyectos/${project.slug}`}
      className="group surface-card flex h-full flex-col overflow-hidden rounded-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-cyan-energy/40 hover:shadow-[0_24px_60px_-28px_rgba(56,189,248,0.5)]"
    >
      <ProjectVisual
        title={project.title}
        category={project.category}
        index={project.sort_order}
        coverUrl={project.cover_url}
      />

      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="cyan">{project.category}</Badge>
          {project.featured && <Badge tone="indigo">Destacado</Badge>}
        </div>

        <h3 className="mt-4 font-display text-lg font-bold leading-tight text-white transition-colors group-hover:text-cyan-energy">
          {project.title}
        </h3>

        <p className="mt-3 line-clamp-3 flex-1 text-[0.86rem] leading-relaxed text-steel">
          {project.summary}
        </p>

        {/* Métricas */}
        {project.metrics.length > 0 && (
          <div className="mt-5 grid grid-cols-3 gap-2 border-t border-white/[0.07] pt-4">
            {project.metrics.slice(0, 3).map((m) => (
              <div key={m.label}>
                <div className="font-mono text-[0.8rem] font-semibold text-cyan-energy">{m.value}</div>
                <div className="mt-0.5 text-[0.6rem] leading-tight text-steel-faint">{m.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Meta */}
        <div className="mt-4 flex flex-wrap items-center gap-3 text-[0.7rem] text-steel-faint">
          {project.year && (
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3 w-3" />
              {project.year}
            </span>
          )}
          {project.client && (
            <span className="inline-flex items-center gap-1.5">
              <Building2 className="h-3 w-3" />
              {project.client}
            </span>
          )}
          <span className="ml-auto inline-flex items-center gap-1 font-mono uppercase tracking-[0.12em] text-cyan-energy opacity-0 transition-opacity group-hover:opacity-100">
            Ver caso
            <ArrowUpRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}
