const paths = { tl: "M1.25 10V1.25H10", tr: "M0 1.25H8.75V10", bl: "M1.25 0V8.75H10", br: "M0 8.75H8.75V0" } as const;
const pos = {
  tl: "top-[-1px] left-[-1px]",
  tr: "top-[-1px] right-[-1px]",
  bl: "bottom-[-1px] left-[-1px]",
  br: "bottom-[-1px] right-[-1px]",
} as const;

export function CornerMarks() {
  return (
    <>
      {(Object.keys(paths) as (keyof typeof paths)[]).map((k) => (
        <span
          key={k}
          aria-hidden="true"
          className={`pointer-events-none absolute leading-none transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${pos[k]}`}
        >
          <svg width="7" height="7" viewBox="0 0 10 10" fill="none" overflow="visible">
            <path d={paths[k]} stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </span>
      ))}
    </>
  );
}
