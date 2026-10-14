import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Acceso administrador",
  description: "Área privada de administración del sitio.",
  robots: { index: false, follow: false },
};

export default async function AccesoPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <section className="relative flex min-h-screen items-center justify-center px-5 py-32">
      <div className="w-full max-w-md">
        <div className="surface-card card-accent relative overflow-hidden rounded-2xl p-8 sm:p-10">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-cyan-energy/10 blur-[70px]" />

          <div className="relative">
            <div className="flex justify-center">
              <Logo size="md" showWordmark showRole />
            </div>

            <div className="mt-8 flex items-center gap-2 border-t border-white/[0.07] pt-7">
              <ShieldCheck className="h-4 w-4 text-cyan-energy" />
              <h1 className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-cyan-energy">
                Área restringida
              </h1>
            </div>

            <p className="mt-3 text-[0.85rem] leading-relaxed text-steel">
              Panel privado de administración. Solo el propietario del sitio puede gestionar
              proyectos, servicios, clientes y contratos desde aquí.
            </p>

            <div className="mt-7">
              <LoginForm next={next ?? "/admin"} />
            </div>

            <p className="mt-7 border-t border-white/[0.07] pt-5 text-center font-mono text-[0.62rem] leading-relaxed text-steel-faint">
              Acceso protegido con Supabase Auth.
              <br />
              Los intentos fallidos quedan registrados.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
