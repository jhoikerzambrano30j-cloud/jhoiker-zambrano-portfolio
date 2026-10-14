import { createServerSupabase } from "./supabase/server";
import type { Profile } from "./types";

export interface AdminSession {
  userId: string;
  email: string;
  fullName: string;
  role: Profile["role"];
}

/** Sesión actual, o null si no hay usuario autenticado. */
export async function getSession() {
  try {
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

/**
 * Verifica que el usuario autenticado sea administrador.
 * Si el perfil no existe todavía, lo crea con rol viewer (nunca admin implícito).
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  const user = await getSession();
  if (!user) return null;

  const supabase = await createServerSupabase();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) return null;
  if (profile.role !== "admin") return null;

  return {
    userId: profile.id,
    email: profile.email ?? user.email ?? "",
    fullName: profile.full_name ?? "Administrador",
    role: profile.role,
  };
}

/** Inicia sesión con correo y contraseña. */
export async function signIn(email: string, password: string) {
  const supabase = await createServerSupabase();
  return supabase.auth.signInWithPassword({ email, password });
}

/** Cierra la sesión actual. */
export async function signOut() {
  const supabase = await createServerSupabase();
  return supabase.auth.signOut();
}

export type { Profile };
