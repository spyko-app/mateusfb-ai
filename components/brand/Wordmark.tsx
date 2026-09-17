export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-baseline font-medium tracking-[-0.01em] leading-none ${className}`}>
      mateusfb<span className="font-mono font-normal opacity-60">.ai</span>
    </span>
  );
}
