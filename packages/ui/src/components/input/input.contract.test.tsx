import type * as React from "react";

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";

import type { InputProps as InputProperties } from ".";
import { Input } from ".";

afterEach(() => {
  cleanup();
});

test("Input prefix and suffix use shadcn InputGroup slots", () => {
  render(
    <Input
      placeholder="Username"
      prefix={<span data-testid="prefix">@</span>}
      suffix={<span data-testid="suffix">.com</span>}
    />,
  );

  const input = screen.getByPlaceholderText("Username");
  const inputGroup = input.closest('[data-slot="input-group"]');
  const prefixAddon = screen
    .getByTestId("prefix")
    .closest('[data-slot="input-group-addon"]');
  const suffixAddon = screen
    .getByTestId("suffix")
    .closest('[data-slot="input-group-addon"]');

  expect(input).toHaveAttribute("data-slot", "input-group-control");
  expect(inputGroup).toBeInTheDocument();
  expect(prefixAddon).toHaveAttribute("data-align", "inline-start");
  expect(suffixAddon).toHaveAttribute("data-align", "inline-end");
});

test("InputGroup affix input keeps shadcn spacing and removes its own focus outline", () => {
  render(
    <Input
      placeholder="Search..."
      prefix={<span data-testid="search-prefix" />}
    />,
  );

  const input = screen.getByPlaceholderText("Search...");
  const inputGroup = input.closest('[data-slot="input-group"]');
  const prefixAddon = screen
    .getByTestId("search-prefix")
    .closest('[data-slot="input-group-addon"]');

  expect(inputGroup).not.toHaveClass("px-3", "py-1");
  expect(prefixAddon).toHaveClass("pl-3");
  expect(input).toHaveClass("px-3", "py-1", "outline-none");
  expect(input).toHaveClass("focus-visible:ring-0");
});

test("Input with prefix uses primary focus border state on its group shell", () => {
  render(
    <Input
      placeholder="Search..."
      prefix={<span data-testid="search-prefix" />}
    />,
  );

  const inputGroup = screen
    .getByTestId("search-prefix")
    .closest('[data-slot="input-group"]');

  expect(inputGroup).toHaveClass("focus-within:border-primary-500");
  expect(inputGroup).toHaveClass("focus-within:ring-primary-500/20");
  expect(inputGroup).toHaveClass(
    "has-[[data-slot=input-group-control]:focus-visible]:border-primary-500",
  );
  expect(inputGroup).toHaveClass(
    "has-[[data-slot=input-group-control]:focus-visible]:ring-primary-500/20",
  );
});

test("Input type number keeps DOM input onChange contract", () => {
  Input({
    type: "number",
    value: 1,
    onChange: (event) => {
      const domEvent: React.ChangeEvent<HTMLInputElement> = event;
      const nextValue: string = event.target.value;
      void domEvent;
      void nextValue;

      // @ts-expect-error Input type=number should not expose InputNumber numeric callback values
      const numericValue: number | null = event;
      void numericValue;
    },
  });
});

test("Input does not accept type time", () => {
  Input({
    // @ts-expect-error use TimePicker directly instead of Input type=time
    type: "time",
  });
});

test("Input props type does not allow type time", () => {
  const properties: InputProperties = {
    // @ts-expect-error public InputProps should reject type=time
    type: "time",
  };

  void properties;
});
