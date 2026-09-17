import { DemoFrame } from "./DemoFrame";
import type { DemoProps } from "../ProjectDemo";

/** Demo de "monitorpilot": stub. Uma tarefa futura preenche o conteúdo dentro da <DemoFrame>. */
export default function MonitorpilotDemo({ label }: DemoProps) {
  return <DemoFrame name="monitorpilot" label={label} />;
}
