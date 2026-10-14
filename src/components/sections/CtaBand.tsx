import Link from "next/link";
import { ArrowUpRight, Mail, MessageCircle } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Reveal } from "@/components/ui/Reveal";

/** Banda final de llamada a la acción. */
export function CtaBand({
  title = "¿Tienes un proyecto",
  highlight = "en mente?",
  description = "Cuéntame qué necesitas y te respondo con una propuesta clara: alcance, tiempos y precio. Sin compromiso.",
}: {
  title?: string;
  highlight?: string;
  description?: string;
}) {
  return (
    <section className="relative py-20 sm:py-28">
      <div className="brand-container">
        <Reveal>
          <div className="surface-card relative overflow-hidden rounded-2xl px-8 py-14 text-center sm:px-14">
            {/* Rejilla y halos */}
            <div className="absolute inset-0 grid-backdrop opacity-50" />
            <div className="absolute left-1/2 top-0 h-56 w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-energy/12 blur-[90px]" />
            <span className="absolute left-5 top-5 h-5 w-5 border-l-2 border-t-2 border-cyan-energy/60" />
            <span className="absolute right-5 top-5 h-5 w-5 border-r-2 border-t-2 border-cyan-energy/60" />
            <span className="absolute bottom-5 left-5 h-5 w-5 border-b-2 border-l-2 border-cyan-energy/60" />
            <span className="absolute bottom-5 right-5 h-5 w-5 border-b-2 border-r-2 border-cyan-energy/60" />

            <div className="relative">
              <div className="flex justify-center">
                <Logo size="sm" showWordmark={false} />
              </div>

              <h2 className="section-title mt-6 text-3xl sm:text-4xl lg:text-5xl">
                <span className="text-white">{title}</span>{" "}
                <span className="text-cyan-energy text-glow-cyan">{highlight}</span>
              </h2>

              <p className="mx-auto mt-5 max-w-xl text-[0.95rem] leading-relaxed text-steel">
                {description}
              </p>

              <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                <Link href="/contacto" className="btn-cyan">
                  <Mail className="h-4 w-4" />
                  Escríbeme
                </Link>
                <Link href="/servicios" className="btn-ghost">
                  Ver servicios
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <a
                  href="https://wa.me/57"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>
              </div>

              <p className="mt-8 font-mono text-[0.66rem] uppercase tracking-[0.2em] text-steel-faint">
                Respuesta en menos de 24 horas hábiles
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
