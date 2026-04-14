import React from "react";

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";

import { CheckboxGroup } from "./checkbox-group";

globalThis.React = React;

afterEach(() => {
  cleanup();
});

type CheckboxGroupStringProperties = React.ComponentProps<
  typeof CheckboxGroup<string>
>;

const structuredOptions = [
  {
    label: (
      <div>
        <div>Product managers</div>
        <div>Roadmaps, priorities, and launch plans.</div>
      </div>
    ),
    value: "product-managers",
  },
  {
    label: (
      <div>
        <div>Engineers</div>
        <div>APIs, implementation details, and technical updates.</div>
      </div>
    ),
    value: "engineers",
  },
] as const;

const renderCheckboxGroup = (properties: CheckboxGroupStringProperties = {}) =>
  render(React.createElement(CheckboxGroup<string>, properties));

describe("CheckboxGroup", () => {
  test("forwards the group style prop to the checkbox-group root", () => {
    const { container } = renderCheckboxGroup({
      style: { justifyContent: "center" },
    });

    expect(container.querySelector('[data-slot="checkbox-group"]')).toHaveStyle(
      {
        justifyContent: "center",
      },
    );
  });

  test("forwards option-level props to each rendered checkbox and composes option onChange", async () => {
    const user = userEvent.setup();
    const optionOnChange = vi.fn();
    const groupOnChange = vi.fn();

    renderCheckboxGroup({
      options: [
        {
          label: "Engineers",
          value: "engineers",
          id: "engineers-option",
          title: "Engineers option",
          required: true,
          style: { justifyContent: "center" },
          onChange: optionOnChange,
        },
      ],
      onChange: groupOnChange,
    });

    const checkbox = screen.getByRole("checkbox", { name: "Engineers" });
    const wrapper = checkbox.closest("label");

    expect(checkbox).toHaveAttribute("id", "engineers-option");
    expect(checkbox).toHaveAttribute("title", "Engineers option");
    expect(checkbox).toBeRequired();
    expect(wrapper).toHaveStyle({ justifyContent: "center" });

    await user.click(checkbox);

    expect(optionOnChange).toHaveBeenCalledTimes(1);
    expect(groupOnChange).toHaveBeenCalledWith(["engineers"]);
  });

  test('passing the documented optionVariant="card" input exposes structured option labels through block label slots', () => {
    const { container } = renderCheckboxGroup({
      options:
        structuredOptions as unknown as CheckboxGroupStringProperties["options"],
      optionVariant: "card",
    } as CheckboxGroupStringProperties);

    expect(
      screen.getByRole("checkbox", {
        name: /Product managers Roadmaps, priorities, and launch plans\./i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", {
        name: /Engineers APIs, implementation details, and technical updates\./i,
      }),
    ).toBeInTheDocument();

    const labelSlots = container.querySelectorAll(
      '[data-slot="checkbox-label"]',
    );

    expect(labelSlots).toHaveLength(2);
    for (const labelSlot of labelSlots) {
      expect(labelSlot.tagName).toBe("DIV");
    }
  });

  test('clicking structured label content still preserves CheckboxGroup onChange semantics when optionVariant="card" is used', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    renderCheckboxGroup({
      options:
        structuredOptions as unknown as CheckboxGroupStringProperties["options"],
      onChange,
      optionVariant: "card",
    } as CheckboxGroupStringProperties);

    await user.click(screen.getByText("Engineers"));
    expect(onChange).toHaveBeenNthCalledWith(1, ["engineers"]);

    await user.click(screen.getByText("Engineers"));
    expect(onChange).toHaveBeenNthCalledWith(2, []);
  });
});
