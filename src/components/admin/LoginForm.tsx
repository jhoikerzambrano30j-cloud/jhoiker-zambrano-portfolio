"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Lock, Mail, Loader2, ShieldAlert, ArrowLeft } from "lucide-react";
import { login, initialLoginState } from "@/app/acceso/actions";
import { cn } from "@/lib/utils";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={cn("btn-cyan w-full", pending && "!opacity-70")}>
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 motion-safe:animate-spin" />
          Verificando…
        </>
      ) : (
        <>
          <Lock className="h-4 w-4" />
          Iniciar sesión
        </>
      )}
    </button>
  );
}

/** Formulario de acceso al panel privado. */
export function LoginForm({ next = "/admin" }: { next?: string }) {
  const [state, formAction] = useActionState(login, initialLoginState);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="next" value={next} />

      {state.message && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-rose-400/30 bg-rose-400/[0.07] p-4"
        >
          <ShieldAlert className="mt-0.5 h-4.5 w-4.5 shrink-0 text-rose-400" />
          <p className="text-[0.85rem] leading-relaxed text-rose-200">{state.message}</p>
        </div>
      )}

      <div>
        <label className="label-mono" htmlFor="email">
          Correo electrónico
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel-faint" />
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="admin@tudominio.com"
            className={cn("field pl-9", state.fieldErrors?.email && "!border-rose-400/60")}
          />
        </div>
        {state.fieldErrors?.email && (
          <p className="mt-1.5 font-mono text-[0.66rem] text-rose-400">{state.fieldErrors.email}</p>
        )}
      </div>

      <div>
        <label className="label-mono" htmlFor="password">
          Contraseña
        </label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel-faint" />
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••••"
            className={cn("field pl-9", state.fieldErrors?.password && "!border-rose-400/60")}
          />
        </div>
        {state.fieldErrors?.password && (
          <p className="mt-1.5 font-mono text-[0.66rem] text-rose-400">
            {state.fieldErrors.password}
          </p>
        )}
      </div>

      <SubmitButton />

      <Link
        href="/"
        className="group flex items-center justify-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-steel-dim transition-colors hover:text-cyan-energy"
      >
        <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-1" />
        Volver al sitio
      </Link>
    </form>
  );
}
