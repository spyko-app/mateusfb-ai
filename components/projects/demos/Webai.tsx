import { DemoFrame } from "./DemoFrame";
import type { DemoProps } from "../ProjectDemo";

/** Demo de "web.ai": stub. Uma tarefa futura preenche o conteúdo dentro da <DemoFrame>. */
export default function WebaiDemo({ label }: DemoProps) {
  return <DemoFrame name="web.ai" label={label} />;
}
