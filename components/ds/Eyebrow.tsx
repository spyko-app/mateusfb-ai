import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

type Props<T extends ElementType> = { as?: T; className?: string; children: ReactNode } & Omit<
  ComponentPropsWithoutRef<T>,
  "as" | "className" | "children"
>;

export function Eyebrow<T extends ElementType = "span">({ as, className = "", children, ...rest }: Props<T>) {
  const Tag = (as ?? "span") as ElementType;
  return (
    <Tag className={`text-eyebrow text-fg/60 ${className}`} {...rest}>
      {children}
    </Tag>
  );
}
