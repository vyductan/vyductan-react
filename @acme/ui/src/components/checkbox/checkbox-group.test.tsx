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

const OPTIONS = [
  { label: "Alpha", value: "alpha" },
  { label: "Beta", value: "beta" },
  { label: "Gamma", value: "gamma", disabled: true },
] as const;

type CheckboxGroupStringProps = React.ComponentProps<typeof CheckboxGroup<string>>;
type CheckboxGroupOption = {
  label: React.ReactNode;
  value: string;
  disabled?: boolean;
};

const checkboxOptions = OPTIONS as unknown as CheckboxGroupOption[];

const renderCheckboxGroup = (props: CheckboxGroupStringProps = {}) =>
  render(React.createElement(CheckboxGroup<string>, props));

const getCheckboxByLabel = (label: string) =>
  screen.getByRole("checkbox", { name: label });

const getOptionWrapperByLabel = (label: string) => {
  const wrapper = getCheckboxByLabel(label).closest('[data-slot="checkbox-group-option"]');

  expect(wrapper).not.toBeNull();

  return wrapper as HTMLElement;
};

describe("CheckboxGroup optionVariant", () => {
  test("default rendering stays unchanged when optionVariant is omitted", () => {
    const { container } = renderCheckboxGroup({ options: checkboxOptions });

    expect(container.querySelectorAll('[data-slot="checkbox-group-option"]')).toHaveLength(0);
    expect(screen.getByRole("checkbox", { name: "Alpha" })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Beta" })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Gamma" })).toBeDisabled();
  });

  test("card mode renders a group-owned wrapper hook for each option", () => {
    renderCheckboxGroup({
      options: checkboxOptions,
      optionVariant: "card",
    } as CheckboxGroupStringProps);

    const wrappers = OPTIONS.map(({ label }) => getOptionWrapperByLabel(label));

    expect(wrappers).toHaveLength(3);
    wrappers.forEach((wrapper) => {
      expect(wrapper).toHaveAttribute("data-slot", "checkbox-group-option");
      expect(wrapper).toHaveAttribute("data-option-variant", "card");
    });
  });

  test("selected card items expose a stable selected hook", () => {
    renderCheckboxGroup({
      options: checkboxOptions,
      value: ["beta"],
      optionVariant: "card",
    } as CheckboxGroupStringProps);

    expect(getOptionWrapperByLabel("Beta")).toHaveAttribute("data-selected", "true");
    expect(getOptionWrapperByLabel("Alpha")).toHaveAttribute("data-selected", "false");
  });

  test("card mode gives unselected options a visible surface while preserving selected emphasis", () => {
    renderCheckboxGroup({
      options: checkboxOptions,
      value: ["beta"],
      optionVariant: "card",
    } as CheckboxGroupStringProps);

    expect(getOptionWrapperByLabel("Alpha").className).toContain("[&>label]:bg-muted/50");
    expect(getOptionWrapperByLabel("Beta").className).toContain("[&>label]:bg-accent/50");
  });

  test("disabled card items expose a stable disabled hook", () => {
    renderCheckboxGroup({
      options: checkboxOptions,
      optionVariant: "card",
    } as CheckboxGroupStringProps);

    expect(getOptionWrapperByLabel("Gamma")).toHaveAttribute("data-disabled", "true");
    expect(getOptionWrapperByLabel("Alpha")).toHaveAttribute("data-disabled", "false");
  });

  test("clicking the card label area preserves the existing onChange payload semantics", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    renderCheckboxGroup({
      options: checkboxOptions,
      onChange,
      optionVariant: "card",
    } as CheckboxGroupStringProps);

    await user.click(screen.getByText("Alpha"));
    expect(onChange).toHaveBeenNthCalledWith(1, ["alpha"]);

    await user.click(screen.getByText("Alpha"));
    expect(onChange).toHaveBeenNthCalledWith(2, []);
  });

  test("keyboard interaction is preserved and the card wrapper follows the focus-visible path", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    renderCheckboxGroup({
      options: checkboxOptions,
      onChange,
      optionVariant: "card",
    } as CheckboxGroupStringProps);

    await user.tab();

    const firstCheckbox = getCheckboxByLabel("Alpha");
    const firstCard = getOptionWrapperByLabel("Alpha");

    expect(firstCheckbox).toHaveFocus();
    expect(firstCard).toContainElement(firstCheckbox);
    expect(firstCard.matches(':focus-within')).toBe(true);

    await user.keyboard(" ");
    expect(onChange).toHaveBeenCalledWith(["alpha"]);
  });
});
