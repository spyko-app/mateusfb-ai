import type { ComponentPropsWithoutRef, ElementType } from "react";
import { CornerMarks } from "./CornerMarks";

type Props<T extends ElementType> = { as?: T; active?: boolean; className?: string } & ComponentPropsWithoutRef<T>;

export function DashedCard<T extends ElementType = "div">({
  as,
  active = false,
  className = "",
  children,
  ...rest
}: Props<T>) {
  const Tag = (as ?? "div") as ElementType;
  return (
    <Tag
      data-active={active ? "true" : "false"}
      className={`group relative border border-dashed border-fg/15 transition-colors duration-200 ${
        active ? "bg-fg text-bg" : "bg-transparent text-fg"
      } ${className}`}
      {...rest}
    >
      {children}
      <CornerMarks />
    </Tag>
  );
}
