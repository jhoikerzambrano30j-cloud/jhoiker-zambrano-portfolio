"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { ProjectCard } from "@/components/sections/ProjectCard";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";
import type { Project, ProjectCategory } from "@/lib/types";

const ALL = "Todos" as const;

/** Portafolio con búsqueda, filtro por categoría y orden. */
export function ProjectsExplorer({ projects }: { projects: Project[] }) {
  const [category, setCategory] = useState<ProjectCategory | typeof ALL>(ALL);
  const [query, setQuery] = useState("");
  const [order, setOrder] = useState<"destacados" | "recientes" | "antiguos">("destacados");

  const categories = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => set.add(p.category));
    return [ALL, ...Array.from(set).sort()];
  }, [projects]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = projects.filter((p) => {
      const matchCat = category === ALL || p.category === category;
      if (!matchCat) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        p.stack.some((s) => s.toLowerCase().includes(q))
      );
    });

    list = [...list];
    if (order === "destacados") {
      list.sort((a, b) => Number(b.featured) - Number(a.featured) || a.sort_order - b.sort_order);
    } else if (order === "recientes") {
      list.sort((a, b) => (b.year ?? 0) - (a.year ?? 0) || a.sort_order - b.sort_order);
    } else {
      list.sort((a, b) => (a.year ?? 0) - (b.year ?? 0) || a.sort_order - b.sort_order);
    }
    return list;
  }, [projects, category, query, order]);

  const activeFilters = (category !== ALL ? 1 : 0) + (query ? 1 : 0);

  return (
    <div>
      {/* Controles */}
      <Reveal>
        <div className="surface-card rounded-xl p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Búsqueda */}
            <div className="relative flex-1 lg:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel-faint" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nombre, stack o etiqueta…"
                className="field pl-9"
                aria-label="Buscar proyectos"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-steel-faint transition-colors hover:text-cyan-energy"
                  aria-label="Limpiar búsqueda"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Orden */}
            <div className="flex items-center gap-3">
              <SlidersHorizontal className="h-4 w-4 shrink-0 text-steel-faint" />
              <select
                value={order}
                onChange={(e) => setOrder(e.target.value as typeof order)}
                className="field !w-auto cursor-pointer"
                aria-label="Ordenar proyectos"
              >
                <option value="destacados">Destacados primero</option>
                <option value="recientes">Más recientes</option>
                <option value="antiguos">Más antiguos</option>
              </select>
            </div>
          </div>

          {/* Categorías */}
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/[0.07] pt-4">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c as ProjectCategory | typeof ALL)}
                className={cn(
                  "rounded-lg border px-3 py-1.5 font-mono text-[0.68rem] uppercase tracking-[0.12em] transition-all duration-200",
                  category === c
                    ? "border-cyan-energy/50 bg-cyan-energy/12 text-cyan-energy"
                    : "border-white/[0.08] bg-white/[0.02] text-steel-dim hover:border-cyan-energy/30 hover:text-chrome",
                )}
                aria-pressed={category === c}
              >
                {c}
              </button>
            ))}

            <span className="ml-auto font-mono text-[0.66rem] text-steel-faint">
              {filtered.length} de {projects.length} proyectos
            </span>
          </div>
        </div>
      </Reveal>

      {/* Resultados */}
      {filtered.length === 0 ? (
        <Reveal className="mt-14">
          <div className="surface-card rounded-xl px-6 py-20 text-center">
            <p className="font-display text-lg font-bold text-white">Sin resultados</p>
            <p className="mx-auto mt-3 max-w-md text-[0.88rem] text-steel">
              No hay proyectos que coincidan con «{query}».
              {activeFilters > 0 && " Prueba quitando los filtros."}
            </p>
            {activeFilters > 0 && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setCategory(ALL);
                }}
                className="btn-ghost mt-6"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </Reveal>
      ) : (
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project, i) => (
            <Reveal key={project.id} delay={Math.min(i, 6) * 70}>
              <ProjectCard project={project} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
