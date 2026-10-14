import Link from "next/link";
import { ArrowLeft, Home, FolderKanban, Mail } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

export default function NotFound() {
  return (
    <section className="relative flex min-h-screen items-center justify-center px-5 py-32">
      <div className="w-full max-w-lg text-center">
        <div className="flex justify-center">
          <Logo size="lg" showWordmark animate />
        </div>

        <p className="mt-10 font-display text-[5rem] font-black leading-none text-white/10 sm:text-[7rem]">
          404
        </p>

        <h1 className="mt-2 font-display text-2xl font-black text-white sm:text-3xl">
          Ruta <span className="text-cyan-energy text-glow-cyan">no encontrada</span>
        </h1>

        <div className="hairline mx-auto mt-6 w-24" />

        <p className="mx-auto mt-6 max-w-md text-[0.92rem] leading-relaxed text-steel">
          La página que buscas no existe o cambió de dirección. Ningún problema: volvamos a terreno
          conocido.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link href="/" className="btn-cyan">
            <Home className="h-4 w-4" />
            Ir al inicio
          </Link>
          <Link href="/proyectos" className="btn-ghost">
            <FolderKanban className="h-4 w-4" />
            Ver proyectos
          </Link>
          <Link href="/contacto" className="btn-ghost">
            <Mail className="h-4 w-4" />
            Contacto
          </Link>
        </div>

        <Link
          href="/"
          className="group mt-10 inline-flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-steel-faint transition-colors hover:text-cyan-energy"
        >
          <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-1" />
          Volver
        </Link>
      </div>
    </section>
  );
}
