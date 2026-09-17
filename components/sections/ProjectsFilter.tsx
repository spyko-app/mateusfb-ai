"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ds";
import type { Messages } from "@/lib/i18n";
import type { ProjectStatus } from "@/content/projects";

type FilterValue = "all" | ProjectStatus;

export function ProjectsFilter({ messages }: { messages: Messages }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = (searchParams.get("status") as FilterValue | null) ?? "all";

  const options: { value: FilterValue; label: string }[] = [
    { value: "all", label: messages.projects.filterAll },
    { value: "shipped", label: messages.projects.filterShipped },
    { value: "building", label: messages.projects.filterBuilding },
  ];

  const setFilter = (value: FilterValue) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") params.delete("status");
    else params.set("status", value);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  };

  return (
    <div className="flex flex-wrap gap-3">
      {options.map((o) => (
        <Button key={o.value} variant={current === o.value ? "solid" : "outline"} onClick={() => setFilter(o.value)}>
          {o.label}
        </Button>
      ))}
    </div>
  );
}
