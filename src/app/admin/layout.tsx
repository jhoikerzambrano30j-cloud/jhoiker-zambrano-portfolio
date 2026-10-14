import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: "Panel de administración",
  robots: { index: false, follow: false },
};

/**
 * Layout del panel privado.
 * Doble verificación: el middleware protege la ruta y aquí se valida el rol.
 * El cliente con service role nunca se usa sin pasar por esta comprobación.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();

  if (!session) {
    redirect("/acceso?next=/admin");
  }

  return <AdminShell session={session}>{children}</AdminShell>;
}
