import { Eyebrow } from "./Eyebrow";
import { Reveal } from "./Reveal";

export function SectionHeader({
  num,
  eyebrow,
  title,
  body,
  id,
}: {
  num: string;
  eyebrow: string;
  title: string;
  body: string;
  id?: string;
}) {
  return (
    <Reveal className="flex w-full flex-col gap-6">
      <div id={id} className="flex items-center gap-8 scroll-mt-32">
        <Eyebrow>{num}</Eyebrow>
        <span aria-hidden className="h-[2px] w-[2px] shrink-0 rounded-full bg-fg/60" />
        <Eyebrow>{eyebrow}</Eyebrow>
      </div>
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        <h2 className="text-subhead text-fg">{title}</h2>
        <p className="text-body text-fg/70">{body}</p>
      </div>
    </Reveal>
  );
}
