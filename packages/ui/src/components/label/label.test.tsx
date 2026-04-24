import "@testing-library/jest-dom/vitest";

import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { Label } from "./label";

describe("Label", () => {
  test("keeps label text selectable for copying", () => {
    render(<Label htmlFor="email">Email address</Label>);

    expect(screen.getByText("Email address").closest("label")).toHaveClass(
      "select-text",
    );
  });
});
