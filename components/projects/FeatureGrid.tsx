import { DashedCard, Reveal } from "@/components/ds";
import type { Locale } from "@/lib/i18n";
import type { ProjectFeature } from "@/content/project-pages";
import { FeatureScene } from "./FeatureScene";

/** Grade de features no estilo xmcp: ilustração 3D ditherizada em cima, título + corpo embaixo. */
export function FeatureGrid({ features, locale }: { features: ProjectFeature[]; locale: Locale }) {
  return (
    <div data-features-grid className="grid grid-cols-1 gap-[9px] md:grid-cols-2 xl:grid-cols-3">
      {features.map((f, i) => (
        <Reveal key={f.id} delay={i * 0.06}>
          <DashedCard className="flex h-full flex-col">
            <FeatureScene shape={f.shape} />
            <div className="flex flex-col gap-2 px-6 pb-6 pt-2">
              <h3 className="text-[18px] font-medium leading-[1.3]">{f.title[locale]}</h3>
              <p className="text-caption text-fg/60">{f.body[locale]}</p>
            </div>
          </DashedCard>
        </Reveal>
      ))}
    </div>
  );
}
