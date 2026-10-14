"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FaqItem {
  q: string;
  a: string;
}

/** Acordeón de preguntas frecuentes. */
export function Faq({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div
            key={item.q}
            className={cn(
              "surface-card overflow-hidden rounded-xl transition-colors",
              isOpen ? "border-cyan-energy/30" : "hover:border-cyan-energy/20",
            )}
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              aria-expanded={isOpen}
            >
              <span className="flex items-start gap-3.5">
                <span className="mt-0.5 font-mono text-[0.68rem] text-cyan-energy/70">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className={cn(
                    "text-[0.92rem] font-semibold leading-snug transition-colors",
                    isOpen ? "text-cyan-energy" : "text-white",
                  )}
                >
                  {item.q}
                </span>
              </span>

              <span
                className={cn(
                  "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition-all duration-300",
                  isOpen
                    ? "rotate-180 border-cyan-energy/45 bg-cyan-energy/12 text-cyan-energy"
                    : "border-white/10 bg-white/[0.03] text-steel",
                )}
              >
                {isOpen ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
              </span>
            </button>

            <div
              className={cn(
                "grid transition-all duration-300 ease-out",
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
              )}
            >
              <div className="overflow-hidden">
                <p className="border-t border-white/[0.07] px-5 py-4 pl-[3.4rem] text-[0.88rem] leading-relaxed text-steel">
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
