import { AlertTriangle, Database, ShieldCheck, Terminal } from "lucide-react";
import { Card, CodeBlock } from "@/components/ui/Primitives";

/** Aviso cuando Supabase o las migraciones aún no están listos. */
export function NotConfigured({
  title = "Base de datos no inicializada",
  reason,
}: {
  title?: string;
  reason?: string;
}) {
  return (
    <Card className="border-amber-400/25 p-6 sm:p-8">
      <div className="flex items-start gap-4">
        <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-400/[0.08]">
          <AlertTriangle className="h-5 w-5 text-amber-300" />
        </span>
        <div className="min-w-0">
          <h2 className="font-display text-lg font-bold text-white">{title}</h2>
          {reason && <p className="mt-2 text-[0.86rem] leading-relaxed text-steel">{reason}</p>}
        </div>
      </div>

      <div className="mt-7 grid gap-6 lg:grid-cols-2">
        <div>
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-cyan-energy" />
            <h3 className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-cyan-energy">
              Paso 1 · Ejecuta las migraciones
            </h3>
          </div>
          <p className="mt-3 text-[0.84rem] leading-relaxed text-steel">
            En el panel de Supabase entra a <strong className="text-chrome">SQL Editor</strong> y
            ejecuta, en este orden, el contenido de:
          </p>
          <ol className="mt-3 space-y-1.5 pl-4 font-mono text-[0.78rem] text-chrome">
            <li className="list-decimal">supabase/migrations/0001_init.sql</li>
            <li className="list-decimal">supabase/migrations/0002_rls.sql</li>
            <li className="list-decimal">supabase/seed.sql</li>
          </ol>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-cyan-energy" />
            <h3 className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-cyan-energy">
              Paso 2 · Crea el administrador
            </h3>
          </div>
          <p className="mt-3 text-[0.84rem] leading-relaxed text-steel">
            Define <span className="font-mono text-chrome">ADMIN_EMAIL</span> y{" "}
            <span className="font-mono text-chrome">ADMIN_PASSWORD</span> en tu{" "}
            <span className="font-mono text-chrome">.env.local</span> y ejecuta:
          </p>
          <CodeBlock className="mt-3" title="terminal" code="pnpm db:seed" />
        </div>
      </div>

      <div className="mt-7 flex items-start gap-3 rounded-xl border border-cyan-energy/20 bg-cyan-energy/[0.05] p-4">
        <ShieldCheck className="mt-0.5 h-4.5 w-4.5 shrink-0 text-cyan-energy" />
        <p className="text-[0.82rem] leading-relaxed text-chrome">
          Las variables de entorno se configuran en Vercel en{" "}
          <strong className="text-white">Settings → Environment Variables</strong>. Recuerda
          mantener <span className="font-mono text-chrome">SUPABASE_SERVICE_ROLE_KEY</span> sin el
          prefijo <span className="font-mono text-chrome">NEXT_PUBLIC_</span> para que nunca llegue
          al navegador.
        </p>
      </div>
    </Card>
  );
}
