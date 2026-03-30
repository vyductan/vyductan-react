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

type CheckboxGroupStringProps = React.ComponentProps<typeof CheckboxGroup<string>>;

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

const renderCheckboxGroup = (props: CheckboxGroupStringProps = {}) =>
  render(React.createElement(CheckboxGroup<string>, props));

describe("CheckboxGroup", () => {
  test('passing the documented optionVariant="card" input still exposes accessible checkboxes for structured option labels', () => {
    renderCheckboxGroup({
      options: structuredOptions as unknown as CheckboxGroupStringProps["options"],
      optionVariant: "card",
    } as CheckboxGroupStringProps);

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
  });

  test('clicking structured label content still preserves CheckboxGroup onChange semantics when optionVariant="card" is used', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    renderCheckboxGroup({
      options: structuredOptions as unknown as CheckboxGroupStringProps["options"],
      onChange,
      optionVariant: "card",
    } as CheckboxGroupStringProps);

    await user.click(screen.getByText("Engineers"));
    expect(onChange).toHaveBeenNthCalledWith(1, ["engineers"]);

    await user.click(screen.getByText("Engineers"));
    expect(onChange).toHaveBeenNthCalledWith(2, []);
  });
});
