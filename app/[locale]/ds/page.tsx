import type { Metadata } from "next";
import { Container, DashedCard, GlassPill, Button, SectionHeader, Eyebrow } from "@/components/ds";

const typeRows = [
  { cls: "text-display", label: "Display" },
  { cls: "text-subhead", label: "Subhead" },
  { cls: "text-pullquote", label: "Pullquote" },
  { cls: "text-body", label: "Body" },
  { cls: "text-caption", label: "Caption" },
  { cls: "text-button", label: "Button" },
  { cls: "text-eyebrow", label: "Eyebrow" },
] as const;

/** Página de dev — fora do índice. */
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function DSPage() {
  return (
    <main className="bg-bg text-fg">
      <Container className="flex flex-col gap-24 py-24">
        <div className="flex flex-col gap-2">
          <Eyebrow>DS · STYLEGUIDE</Eyebrow>
          <h1 className="text-display">Design system</h1>
          <p className="text-body text-fg/70">Sandbox visual dos primitivos — cores, tipografia, motion, componentes.</p>
        </div>

        <section className="flex flex-col gap-6">
          <Eyebrow>TYPE SCALE</Eyebrow>
          <div className="flex flex-col gap-6">
            {typeRows.map((row) => (
              <div key={row.cls} className="flex items-baseline justify-between border-b border-fg/15 pb-4">
                <span className={row.cls}>{row.label}</span>
                <span className="text-caption text-fg/50">{row.cls}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <Eyebrow>DASHED CARD</Eyebrow>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <DashedCard className="p-8">
              <p className="text-body">Normal</p>
            </DashedCard>
            <DashedCard active className="p-8">
              <p className="text-body">Active</p>
            </DashedCard>
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <Eyebrow>GLASS PILL</Eyebrow>
          <div className="relative flex flex-wrap gap-4 p-8 overflow-hidden">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                background:
                  "repeating-linear-gradient(45deg, rgba(255,255,255,.25) 0 12px, transparent 12px 40px)",
              }}
            />
            <GlassPill>
              <ul className="flex items-center gap-2">
                <li>
                  <a href="#" className="block px-[14px] py-[6px] text-button text-fg/60 hover:text-fg">
                    Work
                  </a>
                </li>
                <li>
                  <a href="#" className="block px-[14px] py-[6px] text-button text-fg/60 hover:text-fg">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="block px-[14px] py-[6px] text-button text-fg/60 hover:text-fg">
                    Contact
                  </a>
                </li>
              </ul>
            </GlassPill>
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <Eyebrow>BUTTONS</Eyebrow>
          <div className="flex flex-wrap gap-4">
            <Button variant="solid" href="#">
              Solid
            </Button>
            <Button variant="outline" href="#">
              Outline
            </Button>
            <Button variant="solid" magnetic href="#">
              Magnetic
            </Button>
          </div>
        </section>

        <SectionHeader
          num="01"
          eyebrow="Section header"
          title="Título de exemplo"
          body="Corpo de exemplo do bloco de cabeçalho de seção, com eyebrow numerado e headline."
        />
      </Container>
    </main>
  );
}
