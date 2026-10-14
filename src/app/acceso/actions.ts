"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";

const loginSchema = z.object({
  email: z.string().email("Correo electrónico no válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export type LoginState = {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string>;
};

export const initialLoginState: LoginState = { ok: false, message: "" };

/** Inicia sesión y redirige al panel. */
export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const next = String(formData.get("next") ?? "/admin");

  const parsed = loginSchema.safeParse({
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    password: String(formData.get("password") ?? ""),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, message: "Revisa los datos ingresados.", fieldErrors };
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key || url.includes("xxxx")) {
    return {
      ok: false,
      message:
        "Supabase no está configurado en este entorno. Define NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    };
  }

  const supabase = await createServerSupabase();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error || !data.user) {
    return {
      ok: false,
      message:
        "Credenciales incorrectas. Verifica tu correo y contraseña, o restablece el acceso desde Supabase.",
    };
  }

  // Verificación de rol: solo administradores entran al panel.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!profile || profile.role !== "admin") {
    await supabase.auth.signOut();
    return {
      ok: false,
      message:
        "Tu cuenta no tiene permisos de administrador. Solicita acceso al propietario del sitio.",
    };
  }

  redirect(next.startsWith("/") ? next : "/admin");
}

/** Cierra la sesión y vuelve al inicio. */
export async function logout() {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  redirect("/");
}
