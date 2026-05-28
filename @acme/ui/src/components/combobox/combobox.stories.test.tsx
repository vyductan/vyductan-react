import "@testing-library/jest-dom/vitest";

import { render } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { Basic, Numeric } from "./combobox.stories";

vi.mock("../mdx/component-source", () => ({
  ComponentSource: ({ src }: { src: string }) => (
    <div data-slot="code-box-demo">{src}</div>
  ),
}));

describe("Combobox stories", () => {
  test("keeps both compare previews mounted in the basic story", () => {
    const rendered = Basic.render?.({} as never, {} as never);
    expect(rendered).toBeTruthy();

    const { container } = render(rendered);

    expect(
      container.querySelectorAll('[data-slot="code-box-demo"]'),
    ).toHaveLength(2);
  });

  test("adds the inactive-state hiding class to force-mounted compare panels", () => {
    const rendered = Basic.render?.({} as never, {} as never);
    expect(rendered).toBeTruthy();

    const { container } = render(rendered);
    const panels = container.querySelectorAll<HTMLElement>(
      '[data-slot="tabs-content"]',
    );

    expect(panels).toHaveLength(2);
    expect(panels[0]).toHaveClass("data-[state=inactive]:hidden");
    expect(panels[1]).toHaveClass("data-[state=inactive]:hidden");
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

  test("renders the numeric story through ComponentSource with the expected example path", () => {
    const rendered = Numeric.render?.({} as never, {} as never);
    expect(rendered).toBeTruthy();

    const { container } = render(rendered);

    expect(
      container.querySelector('[data-slot="code-box-demo"]'),
    ).toHaveTextContent("combobox/examples/numeric.tsx");
  });
});
