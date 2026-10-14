/**
 * Fondo de rejilla técnica de marca — presente en todo el sitio.
 * Dos capas: rejilla de 64px con deriva lenta + halos radiales.
 */
export function GridBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Rejilla base con deriva */}
      <div className="absolute inset-0 grid-backdrop motion-safe:animate-[gridDrift_24s_linear_infinite] opacity-70" />

      {/* Halos radiales de marca */}
      <div className="absolute -top-[22rem] left-1/2 h-[46rem] w-[64rem] -translate-x-1/2 rounded-full bg-cyan-energy/[0.07] blur-[130px]" />
      <div className="absolute top-[28%] -left-40 h-[30rem] w-[30rem] rounded-full bg-indigo-automation/[0.06] blur-[120px]" />
      <div className="absolute bottom-0 right-0 h-[34rem] w-[34rem] translate-x-1/3 translate-y-1/4 rounded-full bg-cyan-energy/[0.05] blur-[130px]" />

      {/* Viñeta para dar profundidad */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,transparent_35%,rgba(10,13,20,0.72)_100%)]" />

      {/* Línea de escaneo sutil */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-energy/25 to-transparent motion-safe:animate-[scan_9s_linear_infinite]" />
    </div>
  );
}
