import React from "react";

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

import { Checkbox } from "./checkbox";

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

    rerender(React.createElement(Checkbox, {}, undefined));
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

    const labelContent = screen.getByText("Auto Start").closest('[data-slot="checkbox-label"]');

    expect(labelContent).not.toBeNull();
    expect(labelContent?.tagName).toBe("DIV");
    expect(
      screen.getByRole("checkbox", {
        name: /Auto Start Starting with your OS\./i,
      }),
    ).toBeInTheDocument();
  });
});
