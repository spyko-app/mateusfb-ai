import type { ComponentPropsWithoutRef } from "react";

export const mdxComponents = {
  h2: (props: ComponentPropsWithoutRef<"h2">) => <h2 className="text-subhead mb-6 mt-16" {...props} />,
  h3: (props: ComponentPropsWithoutRef<"h3">) => <h3 className="text-pullquote mt-10" {...props} />,
  p: (props: ComponentPropsWithoutRef<"p">) => (
    <p className="mt-6 text-[19px] leading-[1.6] text-fg/85" {...props} />
  ),
  a: (props: ComponentPropsWithoutRef<"a">) => <a className="underline underline-offset-4" {...props} />,
  code: (props: ComponentPropsWithoutRef<"code">) => (
    <code className="rounded bg-fg/6 px-1 font-mono text-[.9em]" {...props} />
  ),
  pre: (props: ComponentPropsWithoutRef<"pre">) => (
    <pre
      className="mt-6 overflow-x-auto border border-dashed border-fg/15 bg-fg/6 p-5 font-mono text-[14px]"
      {...props}
    />
  ),
  img: (props: ComponentPropsWithoutRef<"img">) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img className="max-w-full grayscale" {...props} alt={props.alt ?? ""} />
  ),
  ul: (props: ComponentPropsWithoutRef<"ul">) => (
    <ul className="mt-6 list-disc pl-6 text-[19px] leading-[1.6] text-fg/85" {...props} />
  ),
  ol: (props: ComponentPropsWithoutRef<"ol">) => (
    <ol className="mt-6 list-decimal pl-6 text-[19px] leading-[1.6] text-fg/85" {...props} />
  ),
  blockquote: (props: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote className="border-l border-fg/30 pl-5 text-fg/70" {...props} />
  ),
};
