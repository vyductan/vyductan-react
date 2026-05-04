import React from "react";

import "@testing-library/jest-dom/vitest";

import { render } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { Steps } from "./index";

const { mockUseBreakpoint } = vi.hoisted(() => ({
  mockUseBreakpoint: vi.fn(),
}));

vi.mock("../grid/hooks/use-breakpoint", () => ({
  default: mockUseBreakpoint,
}));

globalThis.React = React;

globalThis.matchMedia =
  globalThis.matchMedia ??
  (((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as typeof globalThis.matchMedia);

beforeEach(() => {
  mockUseBreakpoint.mockReset();
  mockUseBreakpoint.mockReturnValue({});
});

describe("Steps", () => {
  test("infers finish, process, and wait states from current when item status is absent", () => {
    const { container } = render(
      <Steps
        current={1}
        items={[{ title: "Plan" }, { title: "Build" }, { title: "Ship" }]}
      />,
    );

    const items = [...container.querySelectorAll('[data-slot="steps-item"]')];

    expect(items).toHaveLength(3);
    expect(items[0]).toHaveAttribute("data-status", "finish");
    expect(items[1]).toHaveAttribute("data-status", "process");
    expect(items[2]).toHaveAttribute("data-status", "wait");
  });

  test("lets item status override inferred state", () => {
    const { container } = render(
      <Steps
        current={1}
        items={[
          { title: "Plan", status: "error" },
          { title: "Build" },
          { title: "Ship", status: "finish" },
        ]}
      />,
    );

    const items = [...container.querySelectorAll('[data-slot="steps-item"]')];

    expect(items[0]).toHaveAttribute("data-status", "error");
    expect(items[1]).toHaveAttribute("data-status", "process");
    expect(items[2]).toHaveAttribute("data-status", "finish");
  });

  test("applies top-level status to the current item unless the item overrides it", () => {
    const { container } = render(
      <Steps
        current={1}
        status="error"
        items={[
          { title: "Plan" },
          { title: "Build" },
          { title: "Ship", status: "finish" },
        ]}
      />,
    );

    const items = [...container.querySelectorAll('[data-slot="steps-item"]')];

    expect(items[1]).toHaveAttribute("data-status", "error");
    expect(items[2]).toHaveAttribute("data-status", "finish");
  });

  test("uses one-based numbering in each semantic icon slot when no custom icon is provided", () => {
    const { container } = render(
      <Steps
        current={0}
        items={[
          { title: "Discover" },
          { title: "Design" },
          { title: "Deliver" },
        ]}
      />,
    );

    const icons = [...container.querySelectorAll('[data-slot="steps-item-icon"]')];

    expect(icons).toHaveLength(3);
    expect(icons.map((icon) => icon.textContent?.trim())).toEqual([
      "1",
      "2",
      "3",
    ]);
    expect(icons).not.toContainEqual(
      expect.objectContaining({ textContent: "0" }),
    );
  });

  test("uses iconRender for generated icons with original node and item metadata", () => {
    const { container } = render(
      <Steps
        current={0}
        iconRender={(oriNode, { index, active, item }) => (
          <span data-testid={`rendered-icon-${index}`}>
            {active ? item.title : oriNode}
          </span>
        )}
        items={[{ title: "Plan" }, { title: "Build" }, { title: "Ship" }]}
      />,
    );

    const icons = [...container.querySelectorAll('[data-slot="steps-item-icon"]')];

    expect(icons.map((icon) => icon.textContent?.trim())).toEqual([
      "Plan",
      "2",
      "3",
    ]);
  });

  test("keeps null item icon ahead of iconRender", () => {
    const { container } = render(
      <Steps
        current={0}
        iconRender={() => "rendered"}
        items={[{ title: "Plan", icon: null }]}
      />,
    );

    const icon = container.querySelector('[data-slot="steps-item-icon"]');

    expect(icon).toBeEmptyDOMElement();
    expect(icon).not.toHaveTextContent("rendered");
  });

  test("keeps item icon ahead of iconRender", () => {
    const { container } = render(
      <Steps
        current={0}
        iconRender={() => "rendered"}
        items={[{ title: "Plan", icon: "custom" }]}
      />,
    );

    const icon = container.querySelector('[data-slot="steps-item-icon"]');

    expect(icon).toHaveTextContent("custom");
    expect(icon).not.toHaveTextContent("rendered");
  });

  test("renders subtitle in itemSubtitle and content in itemContent", () => {
    const { container } = render(
      <Steps
        current={0}
        items={[
          {
            title: "Checkout",
            subTitle: "00:00:08",
            content: "Waiting for confirmation",
          },
        ]}
      />,
    );

    const title = container.querySelector('[data-slot="steps-item-title"]');
    const subtitle = container.querySelector('[data-slot="steps-item-subtitle"]');
    const content = container.querySelector('[data-slot="steps-item-content"]');

    expect(title).toHaveTextContent("Checkout");
    expect(subtitle).toHaveTextContent("00:00:08");
    expect(content).toHaveTextContent("Waiting for confirmation");
  });

  test("applies titlePlacement to every item header and direction to the root as semantic layout hooks", () => {
    const { container } = render(
      <Steps
        current={0}
        direction="vertical"
        titlePlacement="vertical"
        items={[{ title: "Plan" }, { title: "Build" }]}
      />,
    );

    const root = container.querySelector('[data-slot="steps"]');
    const headers = [...container.querySelectorAll('[data-slot="steps-item-header"]')];

    expect(root).toHaveAttribute("data-direction", "vertical");
    expect(headers).toHaveLength(2);
    for (const header of headers) {
      expect(header).toHaveAttribute("data-title-placement", "vertical");
    }
  });

  test("collapses horizontal title placement to vertical on xs when responsive is enabled", () => {
    mockUseBreakpoint.mockReturnValue({ xs: true });

    const { container } = render(
      <Steps
        current={0}
        direction="horizontal"
        responsive
        titlePlacement="horizontal"
        items={[{ title: "Plan" }, { title: "Build" }]}
      />,
    );

    const headers = [...container.querySelectorAll('[data-slot="steps-item-header"]')];

    expect(headers).toHaveLength(2);
    for (const header of headers) {
      expect(header).toHaveAttribute("data-title-placement", "vertical");
    }
  });

  test("keeps horizontal rails in the icon row when title placement is vertical", () => {
    const { container } = render(
      <Steps
        current={1}
        direction="horizontal"
        titlePlacement="vertical"
        items={[{ title: "Draft" }, { title: "Review" }, { title: "Publish" }]}
      />,
    );

    const root = container.querySelector('[data-slot="steps"]');
    const items = [...container.querySelectorAll('[data-slot="steps-item"]')];
    const firstWrapper = container.querySelector('[data-slot="steps-item-wrapper"]');
    const firstHeader = container.querySelector('[data-slot="steps-item-header"]');
    const firstSection = container.querySelector('[data-slot="steps-item-section"]');
    const rails = [...container.querySelectorAll('[data-slot="steps-item-rail"]')];

    expect(items).toHaveLength(3);
    expect(items[2]).toHaveClass("flex-1");
    expect(items[2]).not.toHaveClass("last:flex-none");
    expect(root).not.toHaveClass("px-16");
    expect(firstWrapper).toHaveClass("w-full", "flex-col", "items-center");
    expect(firstHeader).toHaveAttribute("data-title-placement", "vertical");
    expect(firstHeader).toHaveClass("w-full", "flex-col", "items-center");
    expect(firstSection).toHaveClass("mt-3", "w-full", "text-center");
    expect(firstSection).not.toHaveClass("-ms-16", "self-start");
    expect(rails).toHaveLength(2);
    expect(rails[0]).toHaveClass(
      "absolute",
      "left-[calc(50%+1rem+0.25rem)]",
      "top-4",
      "h-px",
      "w-[calc(100%-2rem-0.5rem)]",
      "bg-primary-600",
    );
    expect(rails[1]).toHaveClass(
      "absolute",
      "left-[calc(50%+1rem+0.25rem)]",
      "top-4",
      "h-px",
      "w-[calc(100%-2rem-0.5rem)]",
      "bg-border",
    );
    for (const rail of rails) {
      expect(rail).not.toHaveClass("mt-3", "ms-4", "me-4");
    }
  });

  test("marks disabled items and applies semantic classNames and styles to matching slots", () => {
    const { container } = render(
      <Steps
        current={0}
        className="outer-root"
        style={{ padding: 12 }}
        classNames={{
          root: "semantic-root",
          item: "semantic-item",
          itemIcon: "semantic-icon",
          itemRail: "semantic-rail",
        }}
        styles={{
          root: { marginTop: 8 },
          itemTitle: { color: "rgb(1, 2, 3)" },
          itemRail: { opacity: 0.4 },
        }}
        items={[{ title: "Plan", disabled: true }, { title: "Build" }]}
      />,
    );

    const root = container.querySelector('[data-slot="steps"]');
    const firstItem = container.querySelector('[data-slot="steps-item"]');
    const icon = container.querySelector('[data-slot="steps-item-icon"]');
    const title = container.querySelector('[data-slot="steps-item-title"]');
    const rail = container.querySelector('[data-slot="steps-item-rail"]');

    expect(root).toHaveClass("outer-root");
    expect(root).toHaveClass("semantic-root");
    expect(root).toHaveStyle({ padding: "12px", marginTop: "8px" });
    expect(firstItem).toHaveClass("semantic-item");
    expect(firstItem).toHaveAttribute("data-disabled", "true");
    expect(icon).toHaveClass("semantic-icon");
    expect(title).toHaveStyle({ color: "rgb(1, 2, 3)" });
    expect(rail).toHaveClass("semantic-rail");
    expect(rail).toHaveStyle({ opacity: "0.4" });
  });
});
