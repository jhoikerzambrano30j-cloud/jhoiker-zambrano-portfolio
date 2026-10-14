"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Send, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { submitContact, initialContactState } from "@/app/contacto/actions";
import { cn } from "@/lib/utils";

const PROJECT_TYPES = [
  "Sitio web / Landing",
  "Aplicación web a medida",
  "Diseño de interfaz y marca",
  "Servidores e infraestructura",
  "Mantenimiento y evolución",
  "Otro",
];

const BUDGETS = [
  "Menos de $2.000.000 COP",
  "$2.000.000 – $5.000.000 COP",
  "$5.000.000 – $12.000.000 COP",
  "Más de $12.000.000 COP",
  "Aún no lo tengo definido",
];

const TIMELINES = ["Lo antes posible", "En 1 a 3 meses", "En 3 a 6 meses", "Solo estoy explorando"];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={cn("btn-cyan w-full", pending && "!opacity-70")}>
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 motion-safe:animate-spin" />
          Enviando…
        </>
      ) : (
        <>
          <Send className="h-4 w-4" />
          Enviar mensaje
        </>
      )}
    </button>
  );
}

/** Formulario público de contacto. Guarda el lead en Supabase. */
export function ContactForm({ defaultService = "" }: { defaultService?: string }) {
  const [state, formAction] = useActionState(submitContact, initialContactState);
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="source" value="sitio-web" />

      {state.message && (
        <div
          role="status"
          className={cn(
            "flex items-start gap-3 rounded-xl border p-4",
            state.ok
              ? "border-emerald-400/30 bg-emerald-400/[0.07]"
              : "border-rose-400/30 bg-rose-400/[0.07]",
          )}
        >
          {state.ok ? (
            <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-emerald-400" />
          ) : (
            <AlertTriangle className="mt-0.5 h-4.5 w-4.5 shrink-0 text-rose-400" />
          )}
          <p
            className={cn(
              "text-[0.86rem] leading-relaxed",
              state.ok ? "text-emerald-200" : "text-rose-200",
            )}
          >
            {state.message}
          </p>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label-mono" htmlFor="name">
            Nombre completo *
          </label>
          <input
            id="name"
            name="name"
            required
            minLength={2}
            placeholder="Ej. María Restrepo"
            className={cn("field", errors.name && "!border-rose-400/60")}
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name && <p className="mt-1.5 font-mono text-[0.66rem] text-rose-400">{errors.name}</p>}
        </div>

        <div>
          <label className="label-mono" htmlFor="email">
            Correo electrónico *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="tu@empresa.com"
            className={cn("field", errors.email && "!border-rose-400/60")}
            aria-invalid={Boolean(errors.email)}
          />
          {errors.email && (
            <p className="mt-1.5 font-mono text-[0.66rem] text-rose-400">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="label-mono" htmlFor="company">
            Empresa
          </label>
          <input id="company" name="company" placeholder="Opcional" className="field" />
        </div>

        <div>
          <label className="label-mono" htmlFor="phone">
            Teléfono / WhatsApp
          </label>
          <input id="phone" name="phone" placeholder="Opcional" className="field" />
        </div>

        <div>
          <label className="label-mono" htmlFor="project_type">
            Tipo de proyecto
          </label>
          <select
            id="project_type"
            name="project_type"
            defaultValue={defaultService || ""}
            className="field"
          >
            <option value="">Selecciona una opción</option>
            {PROJECT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label-mono" htmlFor="budget_range">
            Presupuesto estimado
          </label>
          <select id="budget_range" name="budget_range" className="field">
            <option value="">Selecciona una opción</option>
            {BUDGETS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="label-mono" htmlFor="timeline">
            ¿Para cuándo lo necesitas?
          </label>
          <select id="timeline" name="timeline" className="field">
            <option value="">Selecciona una opción</option>
            {TIMELINES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="label-mono" htmlFor="message">
          Cuéntame del proyecto *
        </label>
        <textarea
          id="message"
          name="message"
          required
          minLength={20}
          rows={6}
          placeholder="Qué necesitas, qué problema quieres resolver y cualquier contexto que ayude a entender tu caso."
          className={cn("field resize-y", errors.message && "!border-rose-400/60")}
          aria-invalid={Boolean(errors.message)}
        />
        {errors.message && (
          <p className="mt-1.5 font-mono text-[0.66rem] text-rose-400">{errors.message}</p>
        )}
      </div>

      <SubmitButton />

      <p className="text-center font-mono text-[0.64rem] leading-relaxed text-steel-faint">
        Tus datos se tratan conforme a la Ley 1581 de 2012 y solo se usan para responder tu
        solicitud.
      </p>
    </form>
  );
}
