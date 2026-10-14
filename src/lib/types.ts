/**
 * Tipos del dominio — espejo del schema de Supabase (supabase/migrations/0001_init.sql)
 */

export type ProjectStatus = "publicado" | "borrador" | "archivado";
export type ProjectCategory =
  | "Web"
  | "Automatización"
  | "App"
  | "IA"
  | "E-commerce"
  | "Arquitectura"
  | "Data";

export type ServiceTier = "starter" | "professional" | "enterprise";
export type LeadStatus = "nuevo" | "contactado" | "en_negociacion" | "ganado" | "perdido" | "archivado";
export type ContractStatus =
  | "borrador"
  | "enviado"
  | "en_negociacion"
  | "aprobado"
  | "firmado"
  | "rechazado"
  | "cancelado"
  | "completado";
export type AutonomyLevel = "supervisado" | "semiautonomo" | "autonomo";
export type AutomationStatus = "activa" | "pausada" | "borrador" | "error";

export interface Project {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string | null;
  category: ProjectCategory;
  status: ProjectStatus;
  year: number | null;
  client: string | null;
  role: string | null;
  cover_url: string | null;
  gallery: string[];
  stack: string[];
  metrics: { label: string; value: string }[];
  repo_url: string | null;
  live_url: string | null;
  featured: boolean;
  sort_order: number;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  tier: ServiceTier;
  price_from: number | null;
  currency: string;
  duration: string | null;
  deliverables: string[];
  features: string[];
  icon: string;
  featured: boolean;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface SkillGroup {
  id: string;
  category: string;
  items: { name: string; level: number }[];
  sort_order: number;
}

export interface Automation {
  id: string;
  slug: string;
  name: string;
  description: string;
  trigger_type: string;
  tools: string[];
  autonomy_level: AutonomyLevel;
  status: AutomationStatus;
  runs_count: number;
  success_rate: number | null;
  saved_hours_month: number | null;
  workflow: { step: string; detail: string }[];
  featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  project_type: string | null;
  budget_range: string | null;
  timeline: string | null;
  message: string;
  status: LeadStatus;
  source: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContractClause {
  id: string;
  order: number;
  title: string;
  body: string;
  locked: boolean;
  category: "general" | "tecnico" | "legal" | "economico" | "propiedad";
}

export interface ContractVersion {
  version: number;
  created_at: string;
  author: string;
  note: string;
  total: number;
  clauses_count: number;
}

export interface Contract {
  id: string;
  code: string;
  title: string;
  status: ContractStatus;
  template_slug: string | null;
  client_name: string;
  client_company: string | null;
  client_email: string | null;
  client_doc_id: string | null;
  client_address: string | null;
  scope: string;
  deliverables: string[];
  exclusions: string[];
  total: number;
  currency: string;
  payment_plan: { milestone: string; percent: number; amount: number }[];
  start_date: string | null;
  duration_days: number | null;
  warranty_days: number | null;
  clauses: ContractClause[];
  negotiation_log: { at: string; actor: string; action: string; detail: string }[];
  versions: ContractVersion[];
  current_version: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContractTemplate {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  base_price: number;
  duration_days: number;
  warranty_days: number;
  deliverables: string[];
  exclusions: string[];
  clauses: ContractClause[];
  payment_plan: { milestone: string; percent: number; amount: number }[];
  active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: "admin" | "editor" | "viewer";
  avatar_url: string | null;
  headline: string | null;
  bio: string | null;
  created_at: string;
  last_login_at: string | null;
}

export interface SiteSetting {
  key: string;
  value: unknown;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  actor_email: string;
  action: string;
  entity: string;
  entity_id: string | null;
  detail: Record<string, unknown> | null;
  created_at: string;
}

export interface DashboardStats {
  projects: number;
  publishedProjects: number;
  services: number;
  automations: number;
  activeAutomations: number;
  leads: number;
  newLeads: number;
  contracts: number;
  signedContracts: number;
  pipelineValue: number;
  signedValue: number;
  savedHoursMonth: number;
  recentLeads: Lead[];
  recentContracts: Contract[];
  contractsByStatus: { status: ContractStatus; count: number }[];
  leadsByStatus: { status: LeadStatus; count: number }[];
}
