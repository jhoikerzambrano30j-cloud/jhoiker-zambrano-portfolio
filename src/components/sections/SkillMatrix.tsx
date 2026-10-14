"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { SkillGroup } from "@/lib/types";

/** Matriz de habilidades con barras que se animan al entrar en pantalla. */
export function SkillMatrix({ groups }: { groups: SkillGroup[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.08 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {groups.map((group, gi) => (
        <div key={group.id} className="surface-card card-accent rounded-xl p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-bold tracking-[0.1em] text-white">
              {group.category}
            </h3>
            <span className="font-mono text-[0.62rem] text-steel-faint">
              {String(gi + 1).padStart(2, "0")}
            </span>
          </div>

          <div className="mt-5 space-y-4">
            {group.items.map((skill, si) => {
              const delay = gi * 60 + si * 70;
              return (
                <div key={skill.name}>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[0.8rem] font-medium text-chrome">{skill.name}</span>
                    <span className="font-mono text-[0.64rem] text-steel-faint">{skill.level}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-energy to-indigo-automation shadow-[0_0_8px_rgba(56,189,248,0.55)]"
                      style={{
                        width: visible ? `${Math.max(0, Math.min(100, skill.level))}%` : "0%",
                        transition: `width 900ms cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
