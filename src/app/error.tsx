"use client";

import Link from "next/link";
import { AlertTriangle, RotateCw } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="relative flex min-h-screen items-center justify-center px-5 py-32">
      <div className="w-full max-w-lg text-center">
        <div className="flex justify-center">
          <Logo size="md" showWordmark />
        </div>

        <span className="mt-10 inline-flex h-14 w-14 items-center justify-center rounded-xl border border-rose-400/30 bg-rose-400/[0.08]">
          <AlertTriangle className="h-6 w-6 text-rose-300" />
        </span>

        <h1 className="mt-6 font-display text-2xl font-black text-white">
          Algo <span className="text-rose-300">falló</span>
        </h1>

        <div className="hairline mx-auto mt-6 w-24" />

        <p className="mx-auto mt-6 max-w-md text-[0.92rem] leading-relaxed text-steel">
          Ocurrió un error inesperado al cargar esta sección. Puedes intentarlo de nuevo; si
          persiste, escríbeme y lo reviso.
        </p>

        {error.digest && (
          <p className="mt-4 font-mono text-[0.66rem] text-steel-faint">
            Referencia: {error.digest}
          </p>
        )}

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <button type="button" onClick={reset} className="btn-cyan">
            <RotateCw className="h-4 w-4" />
            Reintentar
          </button>
          <Link href="/" className="btn-ghost">
            Ir al inicio
          </Link>
        </div>
      </div>
    </section>
  );
}
