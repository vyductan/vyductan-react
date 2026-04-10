import React from "react";

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

import { Checkbox } from "./checkbox";
import CardComposableExample from "./examples/card-composable";

globalThis.React = React;

afterEach(() => {
  cleanup();
});

function renderCheckbox(
  props: React.ComponentProps<typeof Checkbox> = {},
  children?: React.ReactNode,
): ReturnType<typeof render> {
  return render(React.createElement(Checkbox, props, children));
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

  test("card variant applies the same checked visual defaults as the composable example", () => {
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
      "rounded-lg",
      "border",
      "p-3",
      "hover:bg-accent/50",
      "has-[[aria-checked=true]]:border-blue-600",
      "has-[[aria-checked=true]]:bg-blue-50",
      "dark:has-[[aria-checked=true]]:border-blue-900",
      "dark:has-[[aria-checked=true]]:bg-blue-950",
    );
    expect(checkbox).toHaveClass(
      "data-[state=checked]:border-blue-600",
      "data-[state=checked]:bg-blue-600",
      "data-[state=checked]:text-white",
      "dark:data-[state=checked]:border-blue-700",
      "dark:data-[state=checked]:bg-blue-700",
    );
    expect(checkbox).not.toHaveClass("self-center");
    expect(labelContent).not.toHaveClass("px-2");
  });

  test("composable card example exposes accessible names for both checkbox rows", () => {
    render(<CardComposableExample />);

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
  });
});
