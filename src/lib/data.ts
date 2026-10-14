import { createServerSupabase } from "./supabase/server";
import {
  FALLBACK_CAPABILITIES,
  FALLBACK_PROJECTS,
  FALLBACK_SERVICES,
  FALLBACK_SKILL_GROUPS,
} from "./content";
import type { InfrastructureCapability, Project, Service, SkillGroup } from "./types";

/**
 * Capa de acceso a datos para el sitio público.
 * Intenta Supabase; si no está configurado o falla, cae al contenido local.
 * El sitio nunca se rompe por un problema de datos.
 */

function isConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && key && !url.includes("xxxx"));
}

export async function getProjects(): Promise<Project[]> {
  if (!isConfigured()) return FALLBACK_PROJECTS;
  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("status", "publicado")
      .order("sort_order", { ascending: true });
    if (error || !data || data.length === 0) return FALLBACK_PROJECTS;
    return data as Project[];
  } catch {
    return FALLBACK_PROJECTS;
  }
}

export async function getFeaturedProjects(limit = 3): Promise<Project[]> {
  const projects = await getProjects();
  const featured = projects.filter((p) => p.featured);
  return (featured.length > 0 ? featured : projects).slice(0, limit);
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const projects = await getProjects();
  return projects.find((p) => p.slug === slug) ?? null;
}

export async function getServices(): Promise<Service[]> {
  if (!isConfigured()) return FALLBACK_SERVICES;
  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("active", true)
      .order("sort_order", { ascending: true });
    if (error || !data || data.length === 0) return FALLBACK_SERVICES;
    return data as Service[];
  } catch {
    return FALLBACK_SERVICES;
  }
}

export async function getSkillGroups(): Promise<SkillGroup[]> {
  if (!isConfigured()) return FALLBACK_SKILL_GROUPS;
  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from("skill_groups")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error || !data || data.length === 0) return FALLBACK_SKILL_GROUPS;
    return data as SkillGroup[];
  } catch {
    return FALLBACK_SKILL_GROUPS;
  }
}

/**
 * Capacidades de infraestructura.
 *
 * Viven como contenido curado en `content.ts` y no en la base de datos: son
 * la descripción técnica de un servicio, no datos que cambien con frecuencia.
 * Así la página se renderiza en el servidor sin consultas adicionales.
 */
export function getInfrastructureCapabilities(): InfrastructureCapability[] {
  return FALLBACK_CAPABILITIES;
}
