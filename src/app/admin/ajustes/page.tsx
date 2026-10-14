import { NotConfigured } from "@/components/admin/NotConfigured";
import { SettingsManager } from "@/components/admin/SettingsManager";
import { getAdminSession } from "@/lib/auth";
import { adminListAudit } from "@/lib/admin";
import { createAdminSupabase } from "@/lib/supabase/server";
import type { AuditLog } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminAjustesPage() {
  const session = await getAdminSession();
  if (!session) return null;

  let settings: Record<string, unknown> = {};
  let audit: AuditLog[] = [];
  let error: string | null = null;

  try {
    const supabase = await createAdminSupabase();
    const { data, error: settingsError } = await supabase
      .from("site_settings")
      .select("key, value");

    if (settingsError) throw new Error(settingsError.message);

    settings = Object.fromEntries((data ?? []).map((row) => [row.key, row.value]));
    audit = await adminListAudit(30);
  } catch (err) {
    error = err instanceof Error ? err.message : "Error desconocido";
  }

  if (error) {
    return <NotConfigured title="No se pudieron leer los ajustes" reason={error} />;
  }

  return (
    <SettingsManager
      session={session}
      settings={settings}
      audit={audit}
      supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""}
    />
  );
}
