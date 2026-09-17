import type { ReactNode } from "react";

export function Container({ className = "", children }: { className?: string; children: ReactNode }) {
  return <div className={`mx-auto w-full max-w-[var(--container)] px-6 md:px-[var(--gutter)] ${className}`}>{children}</div>;
}
