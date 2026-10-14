"use client";

import { useRef, useState } from "react";
import { ImagePlus, X, Loader2, AlertTriangle, Link2, Images, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const BUCKET = "project-images";
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB, igual que el límite del bucket
const TIPOS = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];

/* ------------------------------------------------------------------ */
/*  Optimización para web                                              */
/* ------------------------------------------------------------------ */

/** Proporción y tamaño máximo según el uso. */
const OBJETIVO = {
  portada: { ancho: 1600, alto: 1000 },
  galeria: { ancho: 1400, alto: 900 },
} as const;

type Uso = keyof typeof OBJETIVO;

/** Calidad de compresión: buen equilibrio entre peso y nitidez. */
const CALIDAD = 0.82;

/** Por debajo de este peso no vale la pena recomprimir. */
const UMBRAL_RECOMPRESION = 220 * 1024;

interface Optimizada {
  blob: Blob;
  ancho: number;
  alto: number;
  bytesAntes: number;
  bytesDespues: number;
  extension: string;
}

function kb(n: number) {
  return `${Math.round(n / 1024)} KB`;
}

/**
 * Reduce la imagen y la convierte a WebP.
 *
 * Todo ocurre en el navegador, antes de subirla: la foto sale del celular
 * pesando varios megabytes y llega al servidor como un WebP de unos cientos
 * de kilobytes, ya en el tamaño que se muestra en la web.
 */
async function optimizar(file: File, uso: Uso): Promise<Optimizada> {
  const { ancho: maxAncho, alto: maxAlto } = OBJETIVO[uso];

  // Se decodifica respetando la orientación EXIF (fotos de celular).
  let bitmap: ImageBitmap | HTMLImageElement;
  let anchoOriginal: number;
  let altoOriginal: number;

  try {
    const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
    bitmap = bmp;
    anchoOriginal = bmp.width;
    altoOriginal = bmp.height;
  } catch {
    // Navegadores sin createImageBitmap con orientación: se usa <img>.
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new Image();
        el.onload = () => resolve(el);
        el.onerror = () => reject(new Error("No se pudo leer la imagen"));
        el.src = url;
      });
      bitmap = img;
      anchoOriginal = img.naturalWidth;
      altoOriginal = img.naturalHeight;
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  // Escala proporcional: nunca se agranda una imagen pequeña.
  const factor = Math.min(1, maxAncho / anchoOriginal, maxAlto / altoOriginal);
  const ancho = Math.max(1, Math.round(anchoOriginal * factor));
  const alto = Math.max(1, Math.round(altoOriginal * factor));

  const lienzo = document.createElement("canvas");
  lienzo.width = ancho;
  lienzo.height = alto;
  const ctx = lienzo.getContext("2d");
  if (!ctx) throw new Error("El navegador no permitió procesar la imagen");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap as CanvasImageSource, 0, 0, ancho, alto);
  if ("close" in bitmap && typeof bitmap.close === "function") bitmap.close();

  // Se intenta WebP; si el navegador no lo soporta, se cae a JPEG.
  const comoWebp = await new Promise<Blob | null>((resolve) =>
    lienzo.toBlob(resolve, "image/webp", CALIDAD),
  );

  let blob: Blob;
  let extension: string;
  if (comoWebp) {
    blob = comoWebp;
    extension = "webp";
  } else {
    const comoJpeg = await new Promise<Blob | null>((resolve) =>
      lienzo.toBlob(resolve, "image/jpeg", 0.85),
    );
    if (!comoJpeg) throw new Error("El navegador no pudo convertir la imagen");
    blob = comoJpeg;
    extension = "jpg";
  }

  return {
    blob,
    ancho,
    alto,
    bytesAntes: file.size,
    bytesDespues: blob.size,
    extension,
  };
}

/** Genera un nombre de archivo seguro y único con la extensión dada. */
function nombreArchivo(original: string, extension: string) {
  const base = original
    .replace(/\.[^.]+$/, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "imagen";
  const azar = Math.random().toString(36).slice(2, 8);
  return `${base}-${Date.now().toString(36)}-${azar}.${extension}`;
}

function validar(file: File): string | null {
  if (!TIPOS.includes(file.type)) {
    return `Formato no permitido (${file.type || "desconocido"}). Usa JPG, PNG, WebP, AVIF o GIF.`;
  }
  if (file.size > MAX_BYTES) {
    return `La imagen pesa ${(file.size / 1024 / 1024).toFixed(1)} MB. El máximo antes de optimizar es 5 MB.`;
  }
  return null;
}

/**
 * Optimiza (si hace falta) y sube una imagen.
 * Devuelve la URL pública y un resumen de lo que se hizo.
 */
async function subirYOptimizar(
  file: File,
  uso: Uso,
): Promise<{ url: string; resumen: string }> {
  let aSubir: Blob = file;
  let extension = (file.name.split(".").pop() ?? "jpg").toLowerCase();
  let resumen = `Sin recomprimir (${kb(file.size)})`;

  if (file.type !== "image/gif" && file.size > UMBRAL_RECOMPRESION) {
    const o = await optimizar(file, uso);
    aSubir = o.blob;
    extension = o.extension;
    const ahorro = o.bytesAntes > 0 ? Math.round((1 - o.bytesDespues / o.bytesAntes) * 100) : 0;
    resumen = `${kb(o.bytesAntes)} → ${kb(o.bytesDespues)} (−${ahorro}%) · ${o.ancho}×${o.alto} · ${o.extension.toUpperCase()}`;
  }

  const path = nombreArchivo(file.name, extension);
  const supabase = createClient();
  const { error } = await supabase.storage.from(BUCKET).upload(path, aSubir, {
    cacheControl: "31536000",
    upsert: false,
    contentType: aSubir.type || `image/${extension}`,
  });
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, resumen };
}

/* ------------------------------------------------------------------ */
/*  Portada                                                            */
/* ------------------------------------------------------------------ */
export function CoverUploader({
  name,
  initialUrl,
}: {
  name: string;
  initialUrl?: string | null;
}) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [estado, setEstado] = useState<string | null>(null);
  const [trabajando, setTrabajando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modo, setModo] = useState<"subir" | "url">("subir");
  const inputRef = useRef<HTMLInputElement>(null);

  async function onFile(file: File | undefined) {
    if (!file) return;
    const problema = validar(file);
    if (problema) { setError(problema); return; }
    setError(null);
    setTrabajando(true);
    setEstado("Optimizando…");
    try {
      const { url: nueva, resumen } = await subirYOptimizar(file, "portada");
      setUrl(nueva);
      setEstado(resumen);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo subir la imagen");
      setEstado(null);
    } finally {
      setTrabajando(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="label-mono !mb-0">Imagen de portada</span>
        <div className="flex gap-1">
          {(["subir", "url"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setModo(m)}
              className={cn(
                "rounded-md border px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.1em] transition-colors",
                modo === m
                  ? "border-cyan-energy/50 bg-cyan-energy/12 text-cyan-energy"
                  : "border-white/[0.08] text-steel-faint hover:text-chrome",
              )}
            >
              {m === "subir" ? "Subir" : "Enlace"}
            </button>
          ))}
        </div>
      </div>

      <input type="hidden" name={name} value={url} />

      {url && (
        <div className="relative mt-3 overflow-hidden rounded-lg border border-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="Vista previa de la portada" className="h-36 w-full object-cover" />
          <button
            type="button"
            onClick={() => { setUrl(""); setError(null); setEstado(null); }}
            className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-lg border border-white/20 bg-obsidian/80 text-chrome backdrop-blur transition-colors hover:border-rose-400/50 hover:text-rose-300"
            aria-label="Quitar imagen"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {modo === "subir" ? (
        <div className="mt-3">
          <input
            ref={inputRef}
            type="file"
            accept={TIPOS.join(",")}
            className="hidden"
            onChange={(e) => { void onFile(e.target.files?.[0]); e.target.value = ""; }}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={trabajando}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-white/15 bg-white/[0.02] px-3.5 py-3 text-[0.8rem] text-chrome transition-colors hover:border-cyan-energy/45 hover:text-cyan-energy"
          >
            {trabajando ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> {estado ?? "Optimizando…"}</>
            ) : (
              <><ImagePlus className="h-4 w-4" /> {url ? "Cambiar imagen" : "Elegir imagen"}</>
            )}
          </button>
          <p className="mt-1.5 flex items-start gap-1.5 font-mono text-[0.6rem] leading-snug text-steel-faint">
            <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-cyan-energy/60" />
            Se comprime y convierte a WebP sola, a 1600×1000 px. Máximo 5 MB de origen.
          </p>
          {estado && !trabajando && (
            <p className="mt-1 font-mono text-[0.62rem] text-emerald-300/90">{estado}</p>
          )}
        </div>
      ) : (
        <div className="mt-3">
          <div className="relative">
            <Link2 className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-steel-faint" />
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://…/imagen.jpg"
              className="field pl-9"
            />
          </div>
          <p className="mt-1.5 font-mono text-[0.6rem] text-steel-faint">
            Útil si la imagen ya está publicada en otro sitio.
          </p>
        </div>
      )}

      {error && (
        <p className="mt-2 flex items-start gap-2 font-mono text-[0.66rem] leading-snug text-rose-400">
          <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Galería                                                            */
/* ------------------------------------------------------------------ */
export function GalleryUploader({
  name,
  initial = [],
}: {
  name: string;
  initial?: string[];
}) {
  const [urls, setUrls] = useState<string[]>(initial);
  const [trabajando, setTrabajando] = useState(false);
  const [estado, setEstado] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function onFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const lista = Array.from(files);
    for (const f of lista) {
      const problema = validar(f);
      if (problema) { setError(problema); return; }
    }
    setError(null);
    setTrabajando(true);

    const originales = lista.reduce((a, f) => a + f.size, 0);
    let subidas: string[] = [];
    let total = 0;
    try {
      for (let i = 0; i < lista.length; i++) {
        setEstado(lista.length > 1 ? `Optimizando ${i + 1} de ${lista.length}…` : "Optimizando…");
        const { url, resumen } = await subirYOptimizar(lista[i], "galeria");
        subidas = [...subidas, url];
        total += Number(resumen.match(/→ (\d+) KB/)?.[1] ?? 0) * 1024;
      }
      setUrls((prev) => [...prev, ...subidas]);
      const ahorro = originales > 0 && total > 0 ? Math.round((1 - total / originales) * 100) : null;
      setEstado(
        lista.length === 1
          ? "Imagen optimizada y subida"
          : `${lista.length} imágenes optimizadas y subidas${ahorro !== null ? ` (−${ahorro}%)` : ""}`,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron subir las imágenes");
      setEstado(null);
      if (subidas.length > 0) setUrls((prev) => [...prev, ...subidas]);
    } finally {
      setTrabajando(false);
    }
  }

  function mover(i: number, dir: -1 | 1) {
    setUrls((prev) => {
      const copia = [...prev];
      const j = i + dir;
      if (j < 0 || j >= copia.length) return prev;
      [copia[i], copia[j]] = [copia[j], copia[i]];
      return copia;
    });
  }

  return (
    <div>
      <input type="hidden" name={name} value={urls.join("\n")} />

      <div className="flex items-center justify-between">
        <span className="label-mono !mb-0">Galería de imágenes</span>
        <span className="font-mono text-[0.6rem] text-steel-faint">{urls.length} imagen(es)</span>
      </div>

      {urls.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {urls.map((u, i) => (
            <div key={`${u}-${i}`} className="group relative overflow-hidden rounded-lg border border-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={u} alt={`Imagen ${i + 1}`} className="h-20 w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 flex justify-between bg-obsidian/85 px-1 py-0.5 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
                <div className="flex gap-0.5">
                  <button
                    type="button"
                    onClick={() => mover(i, -1)}
                    disabled={i === 0}
                    className="rounded px-1 font-mono text-[0.6rem] text-chrome disabled:opacity-30"
                    aria-label="Mover antes"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => mover(i, 1)}
                    disabled={i === urls.length - 1}
                    className="rounded px-1 font-mono text-[0.6rem] text-chrome disabled:opacity-30"
                    aria-label="Mover después"
                  >
                    →
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setUrls((prev) => prev.filter((_, k) => k !== i))}
                  className="rounded px-1 font-mono text-[0.6rem] text-rose-300"
                  aria-label="Quitar"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={TIPOS.join(",")}
        multiple
        className="hidden"
        onChange={(e) => { void onFiles(e.target.files); e.target.value = ""; }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={trabajando}
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-white/15 bg-white/[0.02] px-3.5 py-2.5 text-[0.8rem] text-chrome transition-colors hover:border-cyan-energy/45 hover:text-cyan-energy"
      >
        {trabajando ? (
          <><Loader2 className="h-3.5 w-3.5 animate-spin" /> {estado ?? "Optimizando…"}</>
        ) : (
          <><Images className="h-3.5 w-3.5" /> Añadir imágenes</>
        )}
      </button>
      <p className="mt-1.5 flex items-start gap-1.5 font-mono text-[0.6rem] leading-snug text-steel-faint">
        <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-cyan-energy/60" />
        Se comprimen y convierten a WebP solas, a 1400×900 px. Puedes elegir varias a la vez.
      </p>
      {estado && !trabajando && (
        <p className="mt-1 font-mono text-[0.62rem] text-emerald-300/90">{estado}</p>
      )}

      {error && (
        <p className="mt-2 flex items-start gap-2 font-mono text-[0.66rem] leading-snug text-rose-400">
          <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
