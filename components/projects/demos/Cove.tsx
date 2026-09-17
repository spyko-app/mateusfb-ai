import { DemoFrame } from "./DemoFrame";
import type { DemoProps } from "../ProjectDemo";

/** Demo de "cove": stub. Uma tarefa futura preenche o conteúdo dentro da <DemoFrame>. */
export default function CoveDemo({ label }: DemoProps) {
  return <DemoFrame name="cove" label={label} />;
}
