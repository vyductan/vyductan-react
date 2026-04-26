import "@testing-library/jest-dom/vitest";

import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { Input } from "@acme/ui/components/input";

import { FormItemRow } from "./form-item-row";

describe("FormItemRow", () => {
  test("renders the description below the control input", () => {
    const { container } = render(
      <FormItemRow
        id="test-form"
        name="amount"
        label="Amount"
        description="Enter the amount in JPY"
        layout="vertical"
        invalid={false}
        errors={[]}
      >
        <Input />
      </FormItemRow>,
    );

    const inputSlot = container.querySelector(
      '[data-slot="form-item-control-input"]',
    );
    const description = screen.getByText("Enter the amount in JPY");

    expect(description).toHaveClass("text-xs");
    expect(inputSlot?.compareDocumentPosition(description)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });
});
