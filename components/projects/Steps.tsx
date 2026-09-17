"use client";

import { useState } from "react";
import { DashedCard, Eyebrow } from "@/components/ds";
import type { Locale } from "@/lib/i18n";
import type { ProjectStep } from "@/content/project-pages";

/** "02 · GET STARTED": lista numerada à esquerda (passo ativo em destaque, clique troca) + bloco de código à direita. */
export function Steps({ steps, locale }: { steps: ProjectStep[]; locale: Locale }) {
  const [active, setActive] = useState(0);
  const step = steps[active];
  return (
    <div data-steps className="grid grid-cols-1 gap-[9px] lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <ol className="flex flex-col">
        {steps.map((s, i) => {
          const on = i === active;
          return (
            <li key={s.title.en} className="border-b border-dashed border-fg/15 last:border-b-0">
              <button
                type="button"
                aria-current={on ? "step" : undefined}
                onClick={() => setActive(i)}
                className={`flex w-full items-baseline gap-6 py-5 text-left transition-colors duration-200 ${on ? "text-fg" : "text-fg/50 hover:text-fg/80"}`}
              >
                <Eyebrow className={on ? "text-fg" : ""}>{String(i + 1).padStart(2, "0")}</Eyebrow>
                <span className="text-body">{s.title[locale]}</span>
              </button>
            </li>
          );
        })}
      </ol>
      <DashedCard className="min-h-[260px]">
        <div className="flex items-center justify-between border-b border-dashed border-fg/15 px-5 py-3">
          <Eyebrow>{String(active + 1).padStart(2, "0")} · {step.title[locale]}</Eyebrow>
        </div>
        <pre className="overflow-x-auto px-5 py-5 font-mono text-[13px] leading-[1.6] text-fg/90">
          <code>{step.code ?? ""}</code>
        </pre>
      </DashedCard>
    </div>
  );
}
