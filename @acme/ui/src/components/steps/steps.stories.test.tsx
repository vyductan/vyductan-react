import type React from "react";

import "@testing-library/jest-dom/vitest";

import { fireEvent, render, screen, within } from "@testing-library/react";
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
      [WithSubtitleAndContent, "steps/examples/with-subtitle-and-content.tsx"],
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

    const draftTitle = container.querySelector(
      '[data-slot="steps-item-title"]',
    );
    expect(draftTitle).toHaveTextContent("Draft");
    expect(draftTitle).toHaveClass("tracking-tight");

    const subtitle = container.querySelector(
      '[data-slot="steps-item-subtitle"]',
    );
    expect(subtitle).toHaveTextContent("Step 1");
    expect(subtitle).toHaveStyle({ letterSpacing: "0.02em" });

    const rail = container.querySelector('[data-slot="steps-item-rail"]');
    expect(rail).toHaveStyle({ opacity: "0.5" });
  });

  test("StatusBar demonstrates custom iconRender status labels", () => {
    const rendered = StatusBar.render?.({} as never, {} as never);
    expect(rendered).toBeTruthy();

    const { container } = render(rendered);

    expect(
      container.querySelector('[data-slot="code-box-demo"]'),
    ).toHaveTextContent("steps/examples/status-bar.tsx");

    const steps = [...container.querySelectorAll('[data-slot="steps"]')];
    const horizontalSteps = steps[0] as HTMLElement;
    const verticalSteps = steps[1] as HTMLElement;
    const horizontalIcons = [
      ...horizontalSteps.querySelectorAll('[data-slot="steps-item-icon"]'),
    ];
    const verticalIcons = [
      ...verticalSteps.querySelectorAll('[data-slot="steps-item-icon"]'),
    ];

    expect(steps).toHaveLength(3);
    expect(horizontalIcons).toHaveLength(4);
    expect(verticalIcons).toHaveLength(4);

    const operationSection = screen
      .getByText("OPERATION STATUS")
      .closest("section");
    expect(operationSection).toHaveClass(
      "rounded-xl",
      "border",
      "bg-background",
      "p-6",
      "shadow-sm",
    );
    const operationSteps = steps[2] as HTMLElement;
    expect(operationSteps).toHaveAttribute("data-size", "default");
    expect(operationSteps).toHaveClass(
      "before:absolute",
      "before:left-0",
      "before:right-0",
      "before:top-6",
      "before:h-1",
      "after:absolute",
      "after:left-0",
      "after:top-6",
      "after:h-1",
      "after:w-[33%]",
    );
    expect(operationSteps.parentElement).toHaveClass("overflow-x-auto");
    const operationItems = [
      ...operationSteps.querySelectorAll('[data-slot="steps-item"]'),
    ];
    const operationIcons = [
      ...operationSteps.querySelectorAll('[data-slot="steps-item-icon"]'),
    ];
    const operationRails = [
      ...operationSteps.querySelectorAll('[data-slot="steps-item-rail"]'),
    ];
    expect(operationItems).toHaveLength(7);
    expect(operationItems[0]).toHaveClass("flex-none", "w-24");
    expect(operationItems[2]).toHaveClass("flex-none", "w-32");
    expect(operationIcons[2]).toHaveClass(
      "min-h-8",
      "min-w-8",
      "bg-background",
      "shadow-[0_0_0_4px_var(--background)]",
      "in-data-[status=process]:text-primary-600",
      "in-data-[status=process]:ring-2",
      "in-data-[status=process]:ring-primary-600",
    );
    const operationIconClasses = [
      "icon-[lucide--check]",
      "icon-[lucide--check]",
      "icon-[lucide--handshake]",
      "icon-[lucide--bell]",
      "icon-[lucide--flag]",
      "icon-[lucide--play]",
      "icon-[lucide--circle-check]",
    ];
    for (const [index, icon] of operationIcons.entries()) {
      expect(icon).toHaveTextContent("");
      expect(
        within(icon as HTMLElement).getByRole("img", { hidden: true }),
      ).toHaveClass(operationIconClasses[index] as string);
    }
    for (const rail of operationRails) {
      expect(rail).toHaveClass("hidden");
    }
    for (const title of [
      "Scheduled",
      "In Prep",
      "Accepted",
      "Reminder",
      "Ready",
      "Started",
      "Ended",
    ]) {
      expect(within(operationSteps).getByText(title)).toBeInTheDocument();
    }
    expect(operationItems[0]).toHaveAttribute("data-status", "finish");
    expect(operationItems[1]).toHaveAttribute("data-status", "finish");
    expect(operationItems[2]).toHaveAttribute("data-status", "process");
    expect(operationItems[3]).toHaveAttribute("data-status", "wait");
    const operationContent = operationItems[2]?.querySelector(
      '[data-slot="steps-item-content"]',
    );
    const operationContentFrame =
      operationContent?.firstElementChild as HTMLElement;
    expect(operationContent).toHaveClass(
      "mt-1",
      "flex",
      "w-full",
      "justify-center",
    );
    expect(operationContentFrame).toHaveClass(
      "relative",
      "mt-2",
      "w-max",
      "bg-muted",
      "border",
      "p-3",
      "shadow-sm",
    );
    expect(operationContentFrame).not.toHaveClass(
      "border-t-0",
      "before:absolute",
      "after:absolute",
      "min-w-[420px]",
    );
    expect(operationContentFrame.firstElementChild).toHaveClass(
      "absolute",
      "-top-1.5",
      "left-1/2",
      "z-20",
      "size-3",
      "bg-muted",
      "rotate-45",
      "border-t",
      "border-l",
    );
    expect(operationContentFrame).toHaveTextContent("Guide accepted.");
    expect(operationContentFrame).toHaveTextContent(
      "Next step: generate reminder.",
    );
    const generateReminderButton = within(operationSteps).getByRole("button", {
      name: "Generate Reminder Email",
    });
    expect(generateReminderButton).toBeInTheDocument();
    expect(generateReminderButton).not.toHaveTextContent("✉");
    expect(
      within(generateReminderButton).getByRole("img", { hidden: true }),
    ).toHaveClass("icon-[lucide--mail]");
    expect(
      horizontalIcons[0]?.querySelector('[role="img"]'),
    ).toBeInTheDocument();
    expect(horizontalIcons[1]).not.toHaveTextContent("Processing");
    expect(horizontalIcons[2]).toBeEmptyDOMElement();
    expect(horizontalIcons[3]).toBeEmptyDOMElement();

    const horizontalItems = [
      ...horizontalSteps.querySelectorAll('[data-slot="steps-item"]'),
    ];
    const horizontalCurrentItem = horizontalItems[1] as HTMLElement;
    const horizontalCurrentSection = horizontalCurrentItem.querySelector(
      '[data-slot="steps-item-section"]',
    );
    expect(horizontalCurrentSection).toHaveTextContent("Processing");
    expect(
      within(horizontalCurrentSection as HTMLElement).getByRole("button", {
        name: "Revert",
      }),
    ).toBeInTheDocument();
    expect(
      within(horizontalCurrentSection as HTMLElement).getByRole("button", {
        name: "Done",
      }),
    ).toBeInTheDocument();

    expect(verticalIcons[1]).toHaveTextContent("Processing");
    expect(verticalIcons[1]).toHaveClass(
      "border-primary-600",
      "bg-primary-600",
      "text-white",
    );
    expect(verticalIcons[1]).not.toHaveClass(
      "in-data-[status=process]:relative",
      "in-data-[status=process]:border-transparent",
      "in-data-[status=process]:bg-transparent",
    );
    const processingIcon = within(verticalIcons[1] as HTMLElement).getByText(
      "Processing",
    );
    expect(processingIcon).toHaveClass("px-3", "py-1");
    expect(verticalIcons[2]).toBeEmptyDOMElement();
    expect(verticalIcons[3]).toBeEmptyDOMElement();

    const verticalCurrentItem = verticalIcons[1]?.closest(
      '[data-slot="steps-item"]',
    );
    expect(verticalCurrentItem).toBeInTheDocument();
    const verticalCurrentSection = verticalCurrentItem?.querySelector(
      '[data-slot="steps-item-section"]',
    );
    expect(verticalCurrentSection).toHaveClass("w-full", "text-center");
    expect(verticalCurrentSection).not.toHaveClass("-ms-16");
    const verticalCurrentTitle = verticalCurrentItem?.querySelector(
      '[data-slot="steps-item-title"]',
    );
    expect(verticalCurrentTitle).not.toHaveTextContent("Processing");
    expect(
      verticalCurrentItem?.querySelector('[data-slot="steps-item-content"]'),
    ).not.toBeInTheDocument();

    const verticalCurrentTitleQueries = within(
      verticalCurrentTitle as HTMLElement,
    );
    fireEvent.click(
      verticalCurrentTitleQueries.getByRole("button", { name: "Done" }),
    );

    const advancedSteps = [
      ...container.querySelectorAll('[data-slot="steps"]'),
    ];
    const advancedVerticalSteps = advancedSteps[1] as HTMLElement;
    const advancedItems = [
      ...advancedVerticalSteps.querySelectorAll('[data-slot="steps-item"]'),
    ];
    const advancedIcons = [
      ...advancedVerticalSteps.querySelectorAll(
        '[data-slot="steps-item-icon"]',
      ),
    ];
    expect(advancedItems[1]).toHaveAttribute("data-status", "finish");
    expect(advancedItems[2]).toHaveAttribute("data-status", "process");
    expect(advancedIcons[2]).toHaveTextContent("Review");
    expect(
      advancedItems[2]?.querySelector('[data-slot="steps-item-title"]'),
    ).not.toHaveTextContent("Review");
    expect(
      advancedItems[2]?.querySelector('[data-slot="steps-item-content"]'),
    ).not.toBeInTheDocument();
    const reviewActions = within(
      advancedItems[2]?.querySelector(
        '[data-slot="steps-item-title"]',
      ) as HTMLElement,
    );
    expect(
      reviewActions.getByRole("button", { name: "Request changes" }),
    ).toBeInTheDocument();
    expect(
      reviewActions.getByRole("button", { name: "Approve" }),
    ).toBeInTheDocument();
    expect(
      reviewActions.queryByRole("button", { name: "Revert" }),
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
