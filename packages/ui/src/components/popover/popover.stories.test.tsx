import "@testing-library/jest-dom/vitest";

import { render } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { Basic } from "./popover.stories";

vi.mock("../mdx/component-source", () => ({
  ComponentSource: ({ src }: { src: string }) => (
    <div data-slot="code-box-demo">{src}</div>
  ),
}));

describe("Popover stories", () => {
  test("renders only the active compare preview so inactive examples unmount cleanly", () => {
    const rendered = Basic.render?.({} as never, {} as never);
    expect(rendered).toBeTruthy();

    const { container } = render(rendered);

    expect(container.querySelectorAll('[data-slot="code-box-demo"]')).toHaveLength(1);
    expect(
      container.querySelector('[data-slot="tabs-content"][data-state="inactive"]')?.children,
    ).toHaveLength(0);
  });

  test("anchors compare tabs to a stable width container", () => {
    const rendered = Basic.render?.({} as never, {} as never);
    expect(rendered).toBeTruthy();

    const { container } = render(rendered);
    const wrapper = container.firstElementChild;
    const tabsRoot = container.querySelector('[data-slot="tabs"]');

    expect(wrapper).toHaveClass("w-full");
    expect(wrapper).toHaveClass("sm:w-3xl");
    expect(tabsRoot).toHaveClass("w-full");
  });

  test("uses descriptive compare tab labels", () => {
    const rendered = Basic.render?.({} as never, {} as never);
    expect(rendered).toBeTruthy();

    const { container } = render(rendered);

    expect(
      container.querySelector('[role="tab"][data-state="active"]')?.textContent,
    ).toContain("Standard API");
    expect(container.textContent).toContain("Composable API");
  });
});
