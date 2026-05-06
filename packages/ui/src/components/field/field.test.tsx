import React from "react";

import "@testing-library/jest-dom/vitest";

import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegendDescription,
} from "./index";

globalThis.React = React;

describe("Field", () => {
  test("uses the custom gap-2 spacing override", () => {
    render(
      <Field data-testid="field">
        <div>Label</div>
        <div>Content</div>
      </Field>,
    );

    const field = screen.getByTestId("field");

    expect(field).toHaveClass("gap-2");
    expect(field).not.toHaveClass("gap-3");
  });

  test("uses gap-6 for field groups", () => {
    render(
      <FieldGroup data-testid="field-group">
        <Field>First</Field>
        <Field>Second</Field>
      </FieldGroup>,
    );

    const fieldGroup = screen.getByTestId("field-group");

    expect(fieldGroup).toHaveClass("gap-6");
    expect(fieldGroup).not.toHaveClass("gap-7");
  });

  test("uses text-xs for field descriptions", () => {
    render(<FieldDescription>Helper text</FieldDescription>);

    expect(screen.getByText("Helper text")).toHaveClass("text-xs");
    expect(screen.getByText("Helper text")).not.toHaveClass("text-sm");
  });

  test("uses text-sm for legend descriptions", () => {
    render(<FieldLegendDescription>Section helper text</FieldLegendDescription>);

    expect(screen.getByText("Section helper text")).toHaveClass("text-sm");
  });

  test("reserves error message height before an error appears", () => {
    const { container, rerender } = render(<FieldError errors={[]} />);

    const errorSlot = container.querySelector('[data-slot="field-error"]');

    expect(errorSlot).toHaveClass("min-h-6");
    expect(errorSlot).toBeEmptyDOMElement();

    rerender(<FieldError errors={[{ message: "Required" }]} />);

    expect(screen.getByRole("alert")).toHaveClass("min-h-6");
    expect(screen.getByText("Required")).toBeInTheDocument();
  });
});
