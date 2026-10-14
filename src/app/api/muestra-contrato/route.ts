import { NextResponse } from "next/server";
import { CONTRACT_TEMPLATES, getTemplate } from "@/lib/contracts/templates";
import { instantiateTemplate, contractFileName } from "@/lib/contracts/engine";
import { generateContractPdf } from "@/lib/contracts/pdf";
import type { Contract } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * Ruta de diagnóstico: genera un contrato de muestra en PDF.
 *
 * Solo existe si la variable de entorno ENABLE_SAMPLE_CONTRACTS es "true".
 * Añádela en .env.local para revisar la plantilla sin necesidad de Supabase,
 * y quítala después. En producción, sin esa variable, responde 404.
 *
 *   GET /api/muestra-contrato                        → desarrollo-web
 *   GET /api/muestra-contrato?plantilla=<slug>
 *   GET /api/muestra-contrato?plantilla=--all        → ZIP no disponible; usa una a la vez
 *   GET /api/muestra-contrato?formato=texto          → texto plano
 */
export async function GET(request: Request) {
  if (process.env.ENABLE_SAMPLE_CONTRACTS !== "true") {
    return NextResponse.json({ error: "No disponible" }, { status: 404 });
  }

  const url = new URL(request.url);
  const slug = url.searchParams.get("plantilla") ?? "desarrollo-web";
  const formato = url.searchParams.get("formato") ?? "pdf";

  const template = getTemplate(slug);
  if (!template) {
    return NextResponse.json(
      { error: `Plantilla no encontrada: ${slug}`, disponibles: CONTRACT_TEMPLATES.map((t) => t.slug) },
      { status: 404 },
    );
  }

  const draft = instantiateTemplate(template, {
    code: "JZ-CT-2026-0001",
    cliente: "María Fernanda Gómez Peña",
    empresa: "Soluciones Andinas S.A.S.",
    doc_id: "52.487.193-4",
    email_cliente: "maria.gomez@solucionesandinas.com",
    contratista: "Jhoiker Zambrano",
    valor: template.base_price,
    plazo: template.duration_days,
    garantia: template.warranty_days,
    fecha_inicio: new Date("2026-03-02T00:00:00.000Z"),
    ciudad: "Medellín",
  });

  const contract: Contract = {
    ...draft,
    id: "muestra",
    created_at: "2026-03-02T00:00:00.000Z",
    updated_at: "2026-03-02T00:00:00.000Z",
  } as Contract;

  if (formato === "texto") {
    const { contractToPlainText } = await import("@/lib/contracts/engine");
    return new NextResponse(contractToPlainText(contract), {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const bytes = await generateContractPdf(contract, {
    ownerName: "Jhoiker Zambrano",
    ownerId: "1.036.784.219",
    city: "Medellín",
  });

  // Se copia a un ArrayBuffer para que el tipo sea BodyInit válido.
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${contractFileName(contract)}"`,
      "Cache-Control": "no-store",
    },
  });
}
