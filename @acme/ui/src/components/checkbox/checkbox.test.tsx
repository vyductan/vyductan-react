import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import React from "react";

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

import { Checkbox } from "./checkbox";
import * as checkboxStories from "./checkbox.stories";

globalThis.React = React;

afterEach(() => {
  cleanup();
});

const checkboxLabelSelector = '[data-slot="checkbox-label"]';

function renderCheckbox(
  props: React.ComponentProps<typeof Checkbox> = {},
  children?: React.ReactNode,
): ReturnType<typeof render> {
  return render(React.createElement(Checkbox, props, children));
}

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

    expect(
      container.querySelector(checkboxLabelSelector),
    ).not.toBeInTheDocument();
  });

  test("renders the loading indicator without the label span when loading", () => {
    const { container } = renderCheckbox({ loading: true }, "Label");

    expect(container.querySelector("svg.animate-spin")).toBeInTheDocument();
    expect(
      container.querySelector(checkboxLabelSelector),
    ).not.toBeInTheDocument();
    expect(within(container).queryByText("Label")).not.toBeInTheDocument();
  });

  test("checked checkbox keeps state-based background classes on the primitive control", () => {
    const { container } = renderCheckbox({
      checked: true,
      "aria-label": "Checked checkbox",
    });
    const checkbox = within(container).getByRole("checkbox", {
      name: "Checked checkbox",
    });

    expect(checkbox).toHaveAttribute("data-state", "checked");
    expect(checkbox.className).toContain("data-[state=checked]:border-primary");
    expect(checkbox.className).toContain("data-[state=checked]:bg-primary");
    expect(checkbox.className).toContain(
      "data-[state=checked]:text-primary-foreground",
    );
  });

  test("card variant renders a card-styled wrapper for structured content", () => {
    const { container } = renderCheckbox(
      { checked: true, variant: "card" } as React.ComponentProps<
        typeof Checkbox
      >,
      <div className="grid gap-1.5 font-normal">
        <p className="text-sm leading-none font-medium">Auto Start</p>
        <p className="text-muted-foreground text-sm">Starting with your OS.</p>
      </div>,
    );

    const wrapper = container.querySelector("label");
    const label = container.querySelector(checkboxLabelSelector);

    expect(wrapper).toHaveClass("rounded-lg");
    expect(wrapper).toHaveClass("border");
    expect(wrapper?.className).toContain("hover:bg-accent/50");
    expect(wrapper?.className).toContain(
      "has-data-[state=checked]:border-primary",
    );
    expect(wrapper?.className).toContain(
      "has-data-[state=checked]:bg-primary/5",
    );
    expect(label).toHaveTextContent("Auto Start");
    expect(label).toHaveTextContent("Starting with your OS.");
    expect(label?.tagName).toBe("DIV");
  });

  test("Card story renders the primitive card variant", () => {
    const Story = checkboxStories.Card.render;

    expect(Story).toBeDefined();

    const { container } = render(React.createElement(Story));

    expect(screen.getByText("Auto Start")).toBeInTheDocument();
    expect(container.querySelector("label")?.className).toContain("rounded-lg");
  });

  test("checkbox group story uses the compounded Checkbox export without card option wrappers", () => {
    const Story = checkboxStories.CheckboxGroup.render;

    expect(Story).toBeDefined();

    const { container } = render(React.createElement(Story));

    expect(screen.getByText("Choose your audience")).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", { name: /Engineers/i }),
    ).toBeInTheDocument();
    expect(
      container.querySelector('[data-slot="checkbox-group-option"]'),
    ).not.toBeInTheDocument();
  });

  test("checkbox docs are wired through imported example partials instead of raw ComponentPreview usage", () => {
    const docsSource = readFileSync(
      resolve(import.meta.dirname, "./checkbox.mdx"),
      "utf8",
    );
    const basicExampleSource = readFileSync(
      resolve(import.meta.dirname, "./examples/basic.mdx"),
      "utf8",
    );
    const cardExampleSource = readFileSync(
      resolve(import.meta.dirname, "./examples/card.mdx"),
      "utf8",
    );

    expect(docsSource).not.toContain("<ComponentPreview");
    expect(docsSource).toMatch(/import\s+\w+\s+from\s+"\.\/examples\/.*\.mdx"/);
    expect(docsSource).toMatch(/<\w+Example\s*\/>/);
    expect(docsSource).toContain('import CardExample from "./examples/card.mdx";');
    expect(docsSource).toContain('import BasicExample from "./examples/basic.mdx";');
    expect(docsSource).toContain("<CardExample />");
    expect(basicExampleSource).toContain('src="checkbox/examples/basic.tsx"');
    expect(cardExampleSource).toContain('src="checkbox/examples/card.tsx"');
  });
});
