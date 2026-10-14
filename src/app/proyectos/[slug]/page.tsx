import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ExternalLink, Github, Calendar, Building2, User, Target, Lightbulb, TrendingUp } from "lucide-react";
import { Badge, Card } from "@/components/ui/Primitives";
import { Reveal } from "@/components/ui/Reveal";
import { ProjectVisual } from "@/components/sections/ProjectVisual";
import { ProjectCard } from "@/components/sections/ProjectCard";
import { CtaBand } from "@/components/sections/CtaBand";
import { getProjectBySlug, getProjects } from "@/lib/data";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const revalidate = 300;

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Proyecto no encontrado" };
  return {
    title: project.title,
    description: project.summary,
    openGraph: { title: project.title, description: project.summary },
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const all = await getProjects();
  const related = all.filter((p) => p.slug !== project.slug).slice(0, 3);

  const paragraphs = (project.description ?? project.summary)
    .split("\n\n")
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <>
      <section className="relative pt-32 pb-12 sm:pt-40">
        <div className="brand-container">
          <Reveal>
            <Link
              href="/proyectos"
              className="group inline-flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-steel-dim transition-colors hover:text-cyan-energy"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
              Volver al portafolio
            </Link>
          </Reveal>

          <div className="mt-8 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
            <div>
              <Reveal>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="cyan">{project.category}</Badge>
                  {project.featured && <Badge tone="indigo">Destacado</Badge>}
                  {project.year && <Badge tone="muted">{project.year}</Badge>}
                </div>
              </Reveal>

              <Reveal delay={80}>
                <h1 className="section-title mt-6 text-3xl sm:text-4xl lg:text-5xl">
                  <span className="text-white">{project.title}</span>
                </h1>
              </Reveal>

              <Reveal delay={130}>
                <div className="hairline mt-6 w-28" />
              </Reveal>

              <Reveal delay={160}>
                <p className="mt-6 max-w-2xl text-[1rem] leading-relaxed text-chrome">
                  {project.summary}
                </p>
              </Reveal>

              <Reveal delay={200}>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  {project.live_url && (
                    <a
                      href={project.live_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-cyan"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Ver en vivo
                    </a>
                  )}
                  {project.repo_url && (
                    <a
                      href={project.repo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-ghost"
                    >
                      <Github className="h-4 w-4" />
                      Repositorio
                    </a>
                  )}
                  <Link href="/contacto" className="btn-ghost">
                    Quiero algo así
                  </Link>
                </div>
              </Reveal>
            </div>

            {/* Ficha técnica */}
            <Reveal delay={140}>
              <Card className="p-6" accent>
                <h2 className="font-mono text-[0.64rem] uppercase tracking-[0.2em] text-steel-faint">
                  Ficha del proyecto
                </h2>

                <dl className="mt-5 space-y-4">
                  {project.client && (
                    <div className="flex items-start gap-3">
                      <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-energy/70" />
                      <div>
                        <dt className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-steel-faint">
                          Cliente
                        </dt>
                        <dd className="mt-0.5 text-[0.86rem] text-chrome">{project.client}</dd>
                      </div>
                    </div>
                  )}
                  {project.role && (
                    <div className="flex items-start gap-3">
                      <User className="mt-0.5 h-4 w-4 shrink-0 text-cyan-energy/70" />
                      <div>
                        <dt className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-steel-faint">
                          Mi rol
                        </dt>
                        <dd className="mt-0.5 text-[0.86rem] text-chrome">{project.role}</dd>
                      </div>
                    </div>
                  )}
                  {project.year && (
                    <div className="flex items-start gap-3">
                      <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-cyan-energy/70" />
                      <div>
                        <dt className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-steel-faint">
                          Año
                        </dt>
                        <dd className="mt-0.5 text-[0.86rem] text-chrome">{project.year}</dd>
                      </div>
                    </div>
                  )}
                </dl>

                <div className="mt-6 border-t border-white/[0.07] pt-5">
                  <h3 className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-steel-faint">
                    Stack técnico
                  </h3>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {project.stack.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-md border border-cyan-energy/20 bg-cyan-energy/[0.06] px-2.5 py-1 font-mono text-[0.68rem] text-cyan-energy/90"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {project.tags.length > 0 && (
                  <div className="mt-6 border-t border-white/[0.07] pt-5">
                    <h3 className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-steel-faint">
                      Etiquetas
                    </h3>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {project.tags.map((tag) => (
                        <span key={tag} className="text-[0.72rem] text-steel-dim">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Visual principal */}
      <section className="pb-4">
        <div className="brand-container">
          <Reveal>
            <div className="surface-card overflow-hidden rounded-2xl">
              <ProjectVisual
                title={project.title}
                category={project.category}
                index={project.sort_order}
                coverUrl={project.cover_url}
                priority
                className="!aspect-[21/9]"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Galería */}
      {project.gallery.length > 0 && (
        <section className="py-14">
          <div className="brand-container">
            <Reveal>
              <h2 className="font-display text-2xl font-black text-white">
                <span className="text-cyan-energy">Galería</span>
              </h2>
              <div className="hairline mt-4 w-20" />
            </Reveal>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {project.gallery.map((url, i) => (
                <Reveal key={`${url}-${i}`} delay={i * 70}>
                  <figure className="surface-card group overflow-hidden rounded-xl">
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-obsidian-800">
                      <Image
                        src={url}
                        alt={`${project.title} — imagen ${i + 1}`}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                    </div>
                    <figcaption className="flex items-center justify-between px-4 py-3">
                      <span className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-steel-faint">
                        {String(i + 1).padStart(2, "0")} / {String(project.gallery.length).padStart(2, "0")}
                      </span>
                      <span className="font-display text-[0.6rem] font-black text-cyan-energy/40">
                        [JZ]
                      </span>
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Métricas */}
      {project.metrics.length > 0 && (
        <section className="py-14">
          <div className="brand-container">
            <div className="grid gap-6 sm:grid-cols-3">
              {project.metrics.map((metric, i) => (
                <Reveal key={metric.label} delay={i * 90}>
                  <Card className="p-6 text-center" accent>
                    <div className="flex items-center justify-center gap-2">
                      <TrendingUp className="h-4 w-4 text-cyan-energy" />
                      <span className="font-display text-3xl font-black text-white">
                        {metric.value}
                      </span>
                    </div>
                    <p className="mt-2 font-mono text-[0.64rem] uppercase tracking-[0.14em] text-steel-dim">
                      {metric.label}
                    </p>
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Descripción */}
      <section className="pb-16">
        <div className="brand-container">
          <div className="grid gap-10 lg:grid-cols-[0.35fr_0.65fr]">
            <Reveal>
              <h2 className="font-display text-2xl font-black text-white">
                El <span className="text-cyan-energy">caso</span>
              </h2>
              <div className="hairline mt-4 w-20" />
            </Reveal>

            <div className="space-y-6">
              {paragraphs.map((p, i) => (
                <Reveal key={i} delay={i * 70}>
                  <p className="text-[0.95rem] leading-[1.85] text-steel">{p}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Enfoque */}
      <section className="pb-16">
        <div className="brand-container">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Target,
                title: "El reto",
                text: "Operación real, usuarios reales y tolerancia cero a las interrupciones. Cada decisión técnica se evaluó contra el impacto en la operación diaria.",
              },
              {
                icon: Lightbulb,
                title: "El enfoque",
                text: "Modelar primero el dominio, después construir. Interfaces simples sobre una base de datos bien pensada y una capa de servicios predecible.",
              },
              {
                icon: TrendingUp,
                title: "El resultado",
                text: "Un sistema que el equipo usa sin fricción, mediciones que antes no existían y una base de código lista para seguir creciendo.",
              },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 90}>
                <Card className="h-full p-6" interactive>
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-cyan-energy/25 bg-cyan-energy/[0.08]">
                    <item.icon className="h-5 w-5 text-cyan-energy" />
                  </span>
                  <h3 className="mt-5 font-display text-base font-bold text-white">{item.title}</h3>
                  <p className="mt-3 text-[0.85rem] leading-relaxed text-steel">{item.text}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Relacionados */}
      {related.length > 0 && (
        <section className="pb-8">
          <div className="brand-container">
            <Reveal>
              <h2 className="font-display text-2xl font-black text-white">
                Otros <span className="text-cyan-energy">proyectos</span>
              </h2>
              <div className="hairline mt-4 w-20" />
            </Reveal>

            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {related.map((p, i) => (
                <Reveal key={p.id} delay={i * 80}>
                  <ProjectCard project={p} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaBand />
    </>
  );
}
