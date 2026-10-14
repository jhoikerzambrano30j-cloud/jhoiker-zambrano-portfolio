"use client";

import { useRef, useState } from "react";
import { ImagePlus, X, Loader2, AlertTriangle, Link2, Images } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const BUCKET = "project-images";
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB, igual que el límite del bucket
const TIPOS = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];

/** Genera un nombre de archivo seguro y único. */
function nombreArchivo(file: File) {
  const base = file.name
    .replace(/\.[^.]+$/, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "imagen";
  const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const azar = Math.random().toString(36).slice(2, 8);
  return `${base}-${Date.now().toString(36)}-${azar}.${ext}`;
}

function validar(file: File): string | null {
  if (!TIPOS.includes(file.type)) {
    return `Formato no permitido (${file.type || "desconocido"}). Usa JPG, PNG, WebP, AVIF o GIF.`;
  }
  if (file.size > MAX_BYTES) {
    return `La imagen pesa ${(file.size / 1024 / 1024).toFixed(1)} MB. El máximo es 5 MB.`;
  }
  return null;
}

/**
 * Sube una imagen a Supabase Storage y devuelve su URL pública.
 * Se usa tanto para la portada como para las imágenes de la galería.
 */
async function subir(file: File): Promise<string> {
  const supabase = createClient();
  const path = nombreArchivo(file);
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
    contentType: file.type,
  });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
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
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modo, setModo] = useState<"subir" | "url">("subir");
  const inputRef = useRef<HTMLInputElement>(null);

  async function onFile(file: File | undefined) {
    if (!file) return;
    const problema = validar(file);
    if (problema) { setError(problema); return; }
    setError(null);
    setSubiendo(true);
    try {
      setUrl(await subir(file));
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo subir la imagen");
    } finally {
      setSubiendo(false);
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

      {/* El valor real que se envía al servidor */}
      <input type="hidden" name={name} value={url} />

      {url && (
        <div className="relative mt-3 overflow-hidden rounded-lg border border-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="Vista previa de la portada" className="h-36 w-full object-cover" />
          <button
            type="button"
            onClick={() => { setUrl(""); setError(null); }}
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
            disabled={subiendo}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-white/15 bg-white/[0.02] px-3.5 py-3 text-[0.8rem] text-chrome transition-colors hover:border-cyan-energy/45 hover:text-cyan-energy"
          >
            {subiendo ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Subiendo…</>
            ) : (
              <><ImagePlus className="h-4 w-4" /> {url ? "Cambiar imagen" : "Elegir imagen"}</>
            )}
          </button>
          <p className="mt-1.5 font-mono text-[0.6rem] text-steel-faint">
            JPG, PNG, WebP, AVIF o GIF · máximo 5 MB · recomendado 1600×1000 px
          </p>
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
  const [subiendo, setSubiendo] = useState(false);
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
    setSubiendo(true);
    try {
      const subidas: string[] = [];
      for (const f of lista) subidas.push(await subir(f));
      setUrls((prev) => [...prev, ...subidas]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron subir las imágenes");
    } finally {
      setSubiendo(false);
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
      {/* Un valor por línea: coincide con el formato que espera el servidor */}
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
        disabled={subiendo}
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-white/15 bg-white/[0.02] px-3.5 py-2.5 text-[0.8rem] text-chrome transition-colors hover:border-cyan-energy/45 hover:text-cyan-energy"
      >
        {subiendo ? (
          <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Subiendo…</>
        ) : (
          <><Images className="h-3.5 w-3.5" /> Añadir imágenes</>
        )}
      </button>

      {error && (
        <p className="mt-2 flex items-start gap-2 font-mono text-[0.66rem] leading-snug text-rose-400">
          <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
