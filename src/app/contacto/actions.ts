"use server";

import { z } from "zod";
import { createAdminSupabase } from "@/lib/supabase/server";

const leadSchema = z.object({
  name: z.string().min(2, "Escribe tu nombre completo").max(120),
  email: z.string().email("Correo electrónico no válido").max(180),
  company: z.string().max(160).optional().or(z.literal("")),
  phone: z.string().max(40).optional().or(z.literal("")),
  project_type: z.string().max(120).optional().or(z.literal("")),
  budget_range: z.string().max(80).optional().or(z.literal("")),
  timeline: z.string().max(80).optional().or(z.literal("")),
  message: z.string().min(20, "Cuéntame un poco más (mínimo 20 caracteres)").max(4000),
  source: z.string().max(120).optional().or(z.literal("")),
});

export type ContactState = {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string>;
};

export const initialContactState: ContactState = { ok: false, message: "" };

/**
 * Recibe el formulario público de contacto y guarda el lead.
 * La tabla `leads` permite INSERT anónimo por RLS, pero nunca SELECT.
 */
export async function submitContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const raw = {
    name: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    company: String(formData.get("company") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    project_type: String(formData.get("project_type") ?? "").trim(),
    budget_range: String(formData.get("budget_range") ?? "").trim(),
    timeline: String(formData.get("timeline") ?? "").trim(),
    message: String(formData.get("message") ?? "").trim(),
    source: String(formData.get("source") ?? "sitio-web").trim(),
  };

  const parsed = leadSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return {
      ok: false,
      message: "Revisa los campos marcados antes de enviar.",
      fieldErrors,
    };
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey || url.includes("xxxx")) {
    return {
      ok: false,
      message:
        "El formulario aún no está conectado a la base de datos. Escríbeme directamente a contacto@jhoikerzambrano.com y te respondo igual.",
    };
  }

  try {
    const supabase = await createAdminSupabase();
    const { error } = await supabase.from("leads").insert({
      name: parsed.data.name,
      email: parsed.data.email,
      company: parsed.data.company || null,
      phone: parsed.data.phone || null,
      project_type: parsed.data.project_type || null,
      budget_range: parsed.data.budget_range || null,
      timeline: parsed.data.timeline || null,
      message: parsed.data.message,
      status: "nuevo",
      source: parsed.data.source || "sitio-web",
    });

    if (error) {
      console.error("[contacto] error al guardar lead:", error.message);
      return {
        ok: false,
        message:
          "No pudimos registrar tu mensaje en este momento. Escríbeme a contacto@jhoikerzambrano.com y lo resolvemos de inmediato.",
      };
    }

    return {
      ok: true,
      message:
        "Mensaje recibido. Te respondo en menos de 24 horas hábiles con los siguientes pasos.",
    };
  } catch (err) {
    console.error("[contacto] excepción:", err);
    return {
      ok: false,
      message:
        "Ocurrió un problema inesperado. Escríbeme a contacto@jhoikerzambrano.com y te atiendo por esa vía.",
    };
  }
}
