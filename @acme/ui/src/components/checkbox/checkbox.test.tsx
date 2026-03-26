import React from "react";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, within } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

import { Checkbox } from "./checkbox";

globalThis.React = React;

afterEach(() => {
  cleanup();
});

const renderCheckbox = (
  props: React.ComponentProps<typeof Checkbox> = {},
  children?: React.ReactNode,
) => render(React.createElement(Checkbox, props, children));

describe("Checkbox rendering", () => {
  test("renders the outer label wrapper", () => {
    const { container } = renderCheckbox({}, "Label");

    expect(container.querySelector("label")).toBeInTheDocument();
  });

  test("renders the label span for string children", () => {
    const { container } = renderCheckbox({}, "Label");

    const label = within(container).getByText("Label");

    expect(label).toHaveAttribute("data-slot", "checkbox-label");
    expect(label.tagName).toBe("SPAN");
  });

  test("renders the label span for numeric children", () => {
    const { container } = renderCheckbox({}, 0);

    const label = within(container).getByText("0");

    expect(label).toHaveAttribute("data-slot", "checkbox-label");
    expect(label.tagName).toBe("SPAN");
  });

  test.each([
    ["undefined children", undefined],
    ["null children", null],
    ["false children", false],
    ["empty string children", ""],
  ])("omits the label span for %s", (_caseName, children) => {
    const { container } = renderCheckbox({}, children);

    expect(container.querySelector('[data-slot="checkbox-label"]')).not.toBeInTheDocument();
  });

  test("renders the loading indicator without the label span when loading", () => {
    const { container } = renderCheckbox({ loading: true }, "Label");

    expect(container.querySelector("svg.animate-spin")).toBeInTheDocument();
    expect(container.querySelector('[data-slot="checkbox-label"]')).not.toBeInTheDocument();
    expect(within(container).queryByText("Label")).not.toBeInTheDocument();
  });
});
