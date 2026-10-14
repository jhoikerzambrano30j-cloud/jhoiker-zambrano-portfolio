import { NextResponse } from "next/server";
import { CONTRACT_TEMPLATES, getTemplate } from "@/lib/contracts/templates";
import { instantiateTemplate, buildVariables, renderTemplate } from "@/lib/contracts/engine";

export const dynamic = "force-dynamic";

/** Diagnóstico temporal: localiza marcadores sin resolver. */
export async function GET() {
  if (process.env.ENABLE_SAMPLE_CONTRACTS !== "true") {
    return NextResponse.json({ error: "No disponible" }, { status: 404 });
  }

  const report: Record<string, unknown> = {};

  for (const template of CONTRACT_TEMPLATES) {
    const draft = instantiateTemplate(template, {
      cliente: "María Fernanda Gómez Peña",
      empresa: "Soluciones Andinas S.A.S.",
      valor: template.base_price,
      plazo: template.duration_days,
      garantia: template.warranty_days,
      ciudad: "Medellín",
    });

    const vars = buildVariables(
      {
        cliente: "María Fernanda Gómez Peña",
        empresa: "Soluciones Andinas S.A.S.",
        valor: template.base_price,
        plazo: template.duration_days,
        garantia: template.warranty_days,
        ciudad: "Medellín",
      },
      template,
    );

    const findMarkers = (arr: string[]) =>
      arr.filter((s) => /\{\{/.test(s));

    report[template.slug] = {
      varsCiudad: vars.ciudad,
      deliverablesConMarcador: findMarkers(draft.deliverables),
      exclusionsConMarcador: findMarkers(draft.exclusions),
      clausesConMarcador: draft.clauses
        .filter((c) => /\{\{/.test(c.body))
        .map((c) => ({ id: c.id, title: c.title, muestra: c.body.slice(0, 120) })),
      excluidoCiudadResuelto: draft.exclusions.some((e) => e.includes("Medellín")),
      totalMarcadores:
        findMarkers(draft.deliverables).length +
        findMarkers(draft.exclusions).length +
        draft.clauses.filter((c) => /\{\{/.test(c.body)).length,
      pruebaRender: renderTemplate("Fuera de {{ciudad}} y {{cliente}}.", vars),
    };
  }

  return NextResponse.json(report, { headers: { "Cache-Control": "no-store" } });
}
