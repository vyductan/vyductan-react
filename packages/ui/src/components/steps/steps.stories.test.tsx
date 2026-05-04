import type React from "react";

import "@testing-library/jest-dom/vitest";

import { render, screen, within } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import * as storiesModule from "./steps.stories";
import {
  Basic,
  Disabled,
  ItemStatus,
  SemanticSlots,
  StatusBar,
  TitlePlacement,
  Vertical,
  WithSubtitleAndContent,
} from "./steps.stories";

vi.mock("../mdx/component-source", () => ({
  ComponentSource: ({
    src,
    __comp__: Example,
  }: {
    src: string;
    __comp__: React.ComponentType;
  }) => (
    <div data-testid="component-source">
      <div data-slot="code-box-demo">{src}</div>
      <Example />
    </div>
  ),
}));

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

describe("Steps stories", () => {
  test("exports the required docs-first stories in spec order", () => {
    expect(
      Object.keys(storiesModule).filter((key) => key !== "default"),
    ).toEqual([
      "Basic",
      "WithSubtitleAndContent",
      "TitlePlacement",
      "Vertical",
      "ItemStatus",
      "StatusBar",
      "Disabled",
      "SemanticSlots",
    ]);
  });

  test("renders each docs-first story through ComponentSource with the expected example path", () => {
    const stories = [
      [Basic, "steps/examples/basic.tsx"],
      [
        WithSubtitleAndContent,
        "steps/examples/with-subtitle-and-content.tsx",
      ],
      [TitlePlacement, "steps/examples/title-placement.tsx"],
      [Vertical, "steps/examples/vertical.tsx"],
      [ItemStatus, "steps/examples/item-status.tsx"],
      [StatusBar, "steps/examples/status-bar.tsx"],
      [Disabled, "steps/examples/disabled.tsx"],
      [SemanticSlots, "steps/examples/semantic-slots.tsx"],
    ] as const;

    for (const [story, expectedPath] of stories) {
      const rendered = story.render?.({} as never, {} as never);
      expect(rendered).toBeTruthy();

      const { container, unmount } = render(rendered);
      expect(
        container.querySelector('[data-slot="code-box-demo"]'),
      ).toHaveTextContent(expectedPath);
      unmount();
    }
  });

  test("TitlePlacement documents both horizontal and vertical variants with shared item data", () => {
    const rendered = TitlePlacement.render?.({} as never, {} as never);
    expect(rendered).toBeTruthy();

    const { container } = render(rendered);

    expect(
      screen.getByRole("heading", { name: 'titlePlacement="horizontal"' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: 'titlePlacement="vertical"' }),
    ).toBeInTheDocument();

    expect(screen.getAllByText("Draft")).toHaveLength(2);
    expect(screen.getAllByText("Review")).toHaveLength(2);
    expect(screen.getAllByText("Publish")).toHaveLength(2);

    expect(
      container.querySelectorAll('[data-title-placement="horizontal"]'),
    ).not.toHaveLength(0);
    expect(
      container.querySelectorAll('[data-title-placement="vertical"]'),
    ).not.toHaveLength(0);
  });

  test("SemanticSlots demonstrates classNames and styles customization", () => {
    const rendered = SemanticSlots.render?.({} as never, {} as never);
    expect(rendered).toBeTruthy();

    const { container } = render(rendered);

    const root = container.querySelector('[data-slot="steps"]');
    expect(root).toHaveClass("rounded-md", "bg-muted/30", "p-4");

    const firstItem = container.querySelector('[data-slot="steps-item"]');
    expect(firstItem).toHaveClass("px-2");

    const firstIcon = container.querySelector('[data-slot="steps-item-icon"]');
    expect(firstIcon).toHaveClass("shadow-sm");

    const draftTitle = container.querySelector('[data-slot="steps-item-title"]');
    expect(draftTitle).toHaveTextContent("Draft");
    expect(draftTitle).toHaveClass("tracking-tight");

    const subtitle = container.querySelector('[data-slot="steps-item-subtitle"]');
    expect(subtitle).toHaveTextContent("Step 1");
    expect(subtitle).toHaveStyle({ letterSpacing: "0.02em" });

    const rail = container.querySelector('[data-slot="steps-item-rail"]');
    expect(rail).toHaveStyle({ opacity: "0.5" });
  });

  test("StatusBar demonstrates custom iconRender status labels", () => {
    const rendered = StatusBar.render?.({} as never, {} as never);
    expect(rendered).toBeTruthy();

    const { container } = render(rendered);

    expect(container.querySelector('[data-slot="code-box-demo"]')).toHaveTextContent(
      "steps/examples/status-bar.tsx",
    );
    const icons = [...container.querySelectorAll('[data-slot="steps-item-icon"]')];
    expect(icons).toHaveLength(4);
    expect(icons[0]?.querySelector('[role="img"]')).toBeInTheDocument();
    expect(icons[1]).toHaveTextContent("Processing");
    expect(icons[1]).toHaveClass(
      "in-data-[status=process]:relative",
      "in-data-[status=process]:border-transparent",
      "in-data-[status=process]:bg-transparent",
    );
    expect(within(icons[1] as HTMLElement).getByText("Processing")).toHaveClass(
      "absolute",
      "left-1/2",
      "z-10",
      "ring-8",
      "ring-background",
      "-translate-x-1/2",
    );
    expect(icons[2]).toBeEmptyDOMElement();
    expect(icons[3]).toBeEmptyDOMElement();

    const currentItem = icons[1]?.closest('[data-slot="steps-item"]');
    expect(currentItem).toBeInTheDocument();
    const currentSection = currentItem?.querySelector('[data-slot="steps-item-section"]');
    expect(currentSection).toHaveClass("w-full", "text-center");
    expect(currentSection).not.toHaveClass("-ms-16");
    const currentTitle = currentItem?.querySelector('[data-slot="steps-item-title"]');
    expect(currentTitle).toHaveClass(
      "in-data-[status=process]:flex",
      "in-data-[status=process]:justify-center",
    );
    expect(currentTitle).not.toHaveTextContent("Processing");

    const currentTitleQueries = within(currentTitle as HTMLElement);
    expect(
      currentTitleQueries.getByRole("button", { name: "Revert" }),
    ).toBeInTheDocument();
    expect(
      currentTitleQueries.getByRole("button", { name: "Done" }),
    ).toBeInTheDocument();
    expect(
      currentItem?.querySelector('[data-slot="steps-item-content"]'),
    ).not.toBeInTheDocument();
  });

  test("Disabled documents the visual-only disabled MVP state", () => {
    const rendered = Disabled.render?.({} as never, {} as never);
    expect(rendered).toBeTruthy();

    const { container } = render(rendered);

    expect(
      screen.getByText(/Disabled items are visual-only in this MVP/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/do not enable clickable step navigation/i),
    ).toBeInTheDocument();

    const disabledItem = screen
      .getByText("Profile")
      .closest('[data-slot="steps-item"]');
    expect(disabledItem).toHaveAttribute("data-disabled", "true");

    const disabledIcon = within(disabledItem as HTMLElement)
      .getByText("2")
      .closest('[data-slot="steps-item-icon"]');
    expect(disabledIcon).toHaveClass("opacity-50");

    expect(
      container.querySelector('[data-slot="code-box-demo"]'),
    ).toHaveTextContent("steps/examples/disabled.tsx");
  });
});
