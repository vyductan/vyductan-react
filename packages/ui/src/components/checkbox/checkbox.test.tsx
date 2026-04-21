import React from "react";

import "@testing-library/jest-dom/vitest";

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { Checkbox } from "./checkbox";
import CardComposableExample from "./examples/card-composable";
import { Checkbox as PublicCheckbox } from "./index";

globalThis.React = React;

afterEach(() => {
  cleanup();
});

function renderCheckbox(
  properties: React.ComponentProps<typeof Checkbox> = {},
  children?: React.ReactNode,
): ReturnType<typeof render> {
  return render(React.createElement(Checkbox, properties, children));
}

describe("Checkbox", () => {
  test("renders an accessible labelled checkbox via the wrapper", () => {
    renderCheckbox({}, "Accept terms and conditions");

    expect(
      screen.getByRole("checkbox", { name: "Accept terms and conditions" }),
    ).toBeInTheDocument();
  });

  test("loading still suppresses inline label content", () => {
    const { container } = renderCheckbox({ loading: true }, "Label");

    expect(screen.getByRole("checkbox")).toBeInTheDocument();
    expect(container.querySelector('[data-slot="checkbox-label"]')).toBeNull();
    expect(screen.queryByText("Label")).not.toBeInTheDocument();
  });

  test("loading with description does not reference suppressed generated ids", () => {
    const { container } = renderCheckbox(
      {
        loading: true,
        description: "Customers can choose any time to start.",
        "aria-labelledby": "external-label",
        "aria-describedby": "external-description",
      },
      "Allow custom start time",
    );

    const checkbox = screen.getByRole("checkbox");

    expect(container.querySelector('[data-slot="checkbox-label"]')).toBeNull();
    expect(screen.queryByText("Allow custom start time")).not.toBeInTheDocument();
    expect(screen.queryByText("Customers can choose any time to start.")).not.toBeInTheDocument();
    expect(checkbox).toHaveAttribute("aria-labelledby", "external-label");
    expect(checkbox).toHaveAttribute("aria-describedby", "external-description");

    const generatedLabelId = checkbox
      .getAttribute("aria-labelledby")
      ?.split(" ")
      .find((id) => id !== "external-label");
    const generatedDescriptionId = checkbox
      .getAttribute("aria-describedby")
      ?.split(" ")
      .find((id) => id !== "external-description");

    expect(generatedLabelId).toBeUndefined();
    expect(generatedDescriptionId).toBeUndefined();
  });

  test("renders the label-content slot only when children exist", () => {
    const { container, rerender } = renderCheckbox({}, "Label");

    expect(screen.getByText("Label")).toHaveAttribute(
      "data-slot",
      "checkbox-label",
    );

    rerender(React.createElement(Checkbox, {}));
    expect(container.querySelector('[data-slot="checkbox-label"]')).toBeNull();

    rerender(React.createElement(Checkbox, {}, false));
    expect(container.querySelector('[data-slot="checkbox-label"]')).toBeNull();

    rerender(React.createElement(Checkbox, {}, ""));
    expect(container.querySelector('[data-slot="checkbox-label"]')).toBeNull();

    rerender(React.createElement(Checkbox, {}, 0));
    expect(screen.getByText("0")).toHaveAttribute(
      "data-slot",
      "checkbox-label",
    );
  });

  test("renders stacked description content for the default variant", () => {
    renderCheckbox(
      {
        description:
          "Customers can choose any time to start instead of selecting from predefined slots.",
      },
      "Allow custom start time",
    );

    const checkbox = screen.getByRole("checkbox", {
      name: "Allow custom start time",
    });
    const wrapper = checkbox.closest("label");
    const labelContent = screen
      .getByText("Allow custom start time")
      .closest('[data-slot="checkbox-label"]');
    const description = screen.getByText(
      "Customers can choose any time to start instead of selecting from predefined slots.",
    );

    expect(wrapper).toHaveClass("items-start");
    expect(labelContent?.tagName).toBe("DIV");
    expect(labelContent).toHaveClass("mt-px", "flex", "flex-col", "gap-0.5");
    expect(description.tagName).toBe("P");
    expect(description).toHaveClass("text-muted-foreground", "text-xs");
    expect(checkbox).toHaveClass("self-start");
    expect(checkbox).toHaveAccessibleName("Allow custom start time");
    expect(checkbox).toHaveAccessibleDescription(
      "Customers can choose any time to start instead of selecting from predefined slots.",
    );
  });

  test("renders stacked description content for the card variant", () => {
    renderCheckbox(
      {
        variant: "card",
        description: "Starting with your OS.",
      },
      "Auto Start",
    );

    const checkbox = screen.getByRole("checkbox", { name: /Auto Start/i });
    const wrapper = checkbox.closest("label");
    const labelContent = screen
      .getByText("Auto Start")
      .closest('[data-slot="checkbox-label"]');
    const description = screen.getByText("Starting with your OS.");

    expect(wrapper).toHaveClass("items-start");
    expect(labelContent?.tagName).toBe("DIV");
    expect(labelContent).toHaveClass("mt-px", "w-full", "flex", "flex-col");
    expect(description.tagName).toBe("P");
    expect(description).toHaveClass("text-muted-foreground", "text-xs");
  });

  test("renders description even when children are omitted", () => {
    const { container } = renderCheckbox({ description: "Only description" });

    const checkbox = screen.getByRole("checkbox");

    expect(screen.getByText("Only description")).toBeInTheDocument();
    expect(container.querySelector('[data-slot="checkbox-label"]')).toBeNull();
    expect(checkbox).toHaveAccessibleDescription("Only description");
  });

  test("documented variant=card usage renders structured label content through a block label slot", () => {
    renderCheckbox(
      { variant: "card" } as React.ComponentProps<typeof Checkbox>,
      <div>
        <div>Auto Start</div>
        <div>Starting with your OS.</div>
      </div>,
    );

    const labelContent = screen
      .getByText("Auto Start")
      .closest('[data-slot="checkbox-label"]');

    expect(labelContent).not.toBeNull();
    expect(labelContent?.tagName).toBe("DIV");
    expect(
      screen.getByRole("checkbox", {
        name: /Auto Start Starting with your OS\./i,
      }),
    ).toBeInTheDocument();
  });

  test("card variant applies the current checked visual defaults", () => {
    renderCheckbox(
      {
        variant: "card",
        defaultChecked: true,
      } as React.ComponentProps<typeof Checkbox>,
      <div className="grid gap-1.5 font-normal">
        <p className="text-sm leading-none font-medium">Auto Start</p>
        <p className="text-muted-foreground text-sm">Starting with your OS.</p>
      </div>,
    );

    const checkbox = screen.getByRole("checkbox", {
      name: /Auto Start Starting with your OS\./i,
    });
    const wrapper = checkbox.closest("label");
    const labelContent = screen
      .getByText("Auto Start")
      .closest('[data-slot="checkbox-label"]');

    expect(wrapper).toHaveClass(
      "items-start",
      "gap-2",
      "rounded-md",
      "border",
      "hover:bg-accent/50",
      "h-auto",
      "min-h-8",
      "px-3",
      "py-2",
      "has-aria-checked:border-primary-600",
      "has-aria-checked:bg-primary-50",
      "dark:has-aria-checked:border-primary-900",
      "dark:has-aria-checked:bg-primary-950",
    );
    expect(checkbox).toHaveClass(
      "data-[state=checked]:border-primary-600",
      "data-[state=checked]:bg-primary-600",
      "data-[state=checked]:text-white",
      "dark:data-[state=checked]:border-primary-700",
      "dark:data-[state=checked]:bg-primary-700",
      "self-start",
    );
    expect(labelContent).toHaveClass("mt-px", "w-full");
    expect(labelContent).not.toHaveClass("px-2");
  });

  test("public Checkbox renders the minus icon when indeterminate", () => {
    const { container } = render(<PublicCheckbox checked="indeterminate" />);

    const checkbox = screen.getByRole("checkbox");
    const indicator = container.querySelector('[data-slot="checkbox-indicator"]');
    const minusIcon = indicator?.querySelector('svg path[d="M5 12h14"]');
    const checkIcon = indicator?.querySelector(
      'svg path[d="m9 12 2 2 4-4"]',
    );

    expect(checkbox).toHaveAttribute("data-state", "indeterminate");
    expect(indicator).not.toBeNull();
    expect(minusIcon).not.toBeNull();
    expect(checkIcon).toBeNull();
  });

  test("public Checkbox without children and without description does not wrap an extra label", () => {
    const { container } = render(
      <label>
        <PublicCheckbox defaultChecked />
        <span>Auto Start</span>
      </label>,
    );

    expect(
      screen.getByRole("checkbox", {
        name: /Auto Start/i,
      }),
    ).toBeInTheDocument();
    expect(container.querySelectorAll("label label")).toHaveLength(0);
  });

  test("public Checkbox renders description-only content through the wrapped API", () => {
    render(<PublicCheckbox description="Only description" />);

    const checkbox = screen.getByRole("checkbox");

    expect(screen.getByText("Only description")).toBeInTheDocument();
    expect(checkbox).toHaveAccessibleDescription("Only description");
  });

  test("public Checkbox without children still emits onChange when clicked", () => {
    const onChange = vi.fn();

    render(<PublicCheckbox checked={false} onChange={onChange} />);

    fireEvent.click(screen.getByRole("checkbox"));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0]?.[0]?.target?.checked).toBe(true);
  });

  test("public Checkbox without children and with onChange still avoids nested labels", () => {
    const { container } = render(
      <label>
        <PublicCheckbox defaultChecked onChange={vi.fn()} />
        <span>Auto Start</span>
      </label>,
    );

    expect(
      screen.getByRole("checkbox", {
        name: /Auto Start/i,
      }),
    ).toBeInTheDocument();
    expect(container.querySelectorAll("label label")).toHaveLength(0);
  });

  test("composable card example avoids nested label wrappers while preserving accessible names", () => {
    const { container } = render(<CardComposableExample />);

    expect(
      screen.getByRole("checkbox", {
        name: /Auto Start Starting with your OS\./i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", {
        name: /Auto update Download and install new version/i,
      }),
    ).toBeInTheDocument();
    expect(container.querySelectorAll("label label")).toHaveLength(0);
  });
});
