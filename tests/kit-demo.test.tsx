import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup, fireEvent, act, waitFor } from "@testing-library/react";
import KitDemo from "@/components/projects/demos/Kit";

describe("KitDemo (vibe100coding kit)", () => {
  afterEach(cleanup);

  it("renders the 6 stages, starts on Spec and shows the status bar", () => {
    const { container } = render(<KitDemo locale="en" label="Demo" />);
    const root = container.querySelector("[data-kit-demo]")!;
    expect(root.getAttribute("data-stage")).toBe("spec");
    expect(container.querySelectorAll("[data-stage-btn]").length).toBe(6);
    expect(container.querySelector("[data-kit-status]")?.textContent).toContain("hooks: on");
    expect(container.querySelector("[data-kit-status]")?.textContent).toContain("branch: task-3");
  });

  it("clicking Gates activates it and shows the meta-gate row; Integrate bumps the queue", async () => {
    const { container } = render(<KitDemo locale="pt" label="Demonstração" />);
    act(() => { fireEvent.click(container.querySelector("[data-stage-btn='gates']")!); });
    expect(container.querySelector("[data-kit-demo]")?.getAttribute("data-stage")).toBe("gates");
    expect(container.querySelector("[data-stage-btn='gates']")?.getAttribute("data-active")).toBe("true");
    await waitFor(() => expect(container.textContent).toContain("meta-gate"));
    act(() => { fireEvent.click(container.querySelector("[data-stage-btn='integrate']")!); });
    expect(container.querySelector("[data-kit-status]")?.textContent).toContain("fila: 1");
  });

  it("arrow keys move between stages", () => {
    const { container } = render(<KitDemo locale="en" label="Demo" />);
    const root = container.querySelector("[data-kit-demo]")!;
    act(() => { fireEvent.keyDown(root, { key: "ArrowRight" }); });
    expect(root.getAttribute("data-stage")).toBe("plan");
    act(() => { fireEvent.keyDown(root, { key: "ArrowLeft" }); });
    act(() => { fireEvent.keyDown(root, { key: "ArrowLeft" }); });
    expect(root.getAttribute("data-stage")).toBe("learn");
  });
});
