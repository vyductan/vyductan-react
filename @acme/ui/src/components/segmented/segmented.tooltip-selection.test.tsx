import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, describe, expect, it } from "vitest";

import { Segmented } from "./index";

// Segmented observes its list to fade the scroll edges; jsdom has no
// ResizeObserver and the fade is irrelevant to what is under test here.
beforeAll(() => {
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

// This project runs without `globals`, so Testing Library cannot register its
// own auto-cleanup; without this each render stacks in the same document.
afterEach(cleanup);

/**
 * Regression: an option with a `tooltip` is wrapped in `TooltipTrigger asChild`,
 * whose own `data-state` (open/closed/delayed-open) is spread onto the Tabs
 * trigger AFTER the Tabs one and wins. Anything styled on
 * `data-[state=active]` is therefore dead on a tooltipped Segmented — which is
 * why the variants key off `aria-selected` instead.
 */
describe("Segmented with tooltips", () => {
  const OPTIONS = [
    { value: "a", label: "Morning", tooltip: "08:00-12:00" },
    { value: "b", label: "Evening", tooltip: "17:00-21:00" },
  ];

  it("marks the selected item with aria-selected", () => {
    render(<Segmented value="a" options={OPTIONS} />);

    expect(
      screen
        .getByRole("tab", { name: "Morning" })
        .getAttribute("aria-selected"),
    ).toBe("true");
    expect(
      screen
        .getByRole("tab", { name: "Evening" })
        .getAttribute("aria-selected"),
    ).toBe("false");
  });

  it("styles selection on aria-selected, not data-state", () => {
    render(<Segmented value="a" options={OPTIONS} />);
    const morning = screen.getByRole("tab", { name: "Morning" });

    expect(morning.className).toContain("aria-selected:bg-background");
    expect(morning.className).not.toContain(
      "data-[state=active]:bg-background",
    );
    // The tooltip has overwritten it — this is the trap being guarded.
    expect(morning.dataset.state).not.toBe("active");
  });

  it("still changes value on click", async () => {
    const seen: string[] = [];
    render(
      <Segmented
        defaultValue="a"
        options={OPTIONS}
        onChange={(value) => seen.push(value)}
      />,
    );

    // userEvent, not fireEvent.click: Radix switches on mousedown/focus.
    await userEvent.click(screen.getByRole("tab", { name: "Evening" }));
    expect(seen).toContain("b");
  });
});
