import React from "react";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { Field } from "./index";

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
});
