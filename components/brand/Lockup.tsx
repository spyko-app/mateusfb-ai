import { Mark } from "./Mark";
import { Wordmark } from "./Wordmark";

export function Lockup({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Mark size={size} />
      <Wordmark />
    </span>
  );
}
