import "@testing-library/jest-dom/vitest";

import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";

import { Button } from "./button";

// Regression: a non-element `icon` (e.g. an icon-name string) used to crash
// with Radix "Slot failed to slot onto its children". It must now render
// safely instead of throwing.
test("string icon does not crash the Button", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

  expect(() =>
    render(<Button icon="icon-[lucide--x]">Clear All</Button>),
  ).not.toThrow();

  expect(screen.getByRole("button")).toHaveTextContent("Clear All");
  expect(warn).toHaveBeenCalled(); // antd-style dev warning fired

  warn.mockRestore();
});

test("element icon still renders inside the button", () => {
  render(<Button icon={<svg data-testid="icon" />} aria-label="close" />);

  expect(screen.getByTestId("icon")).toBeInTheDocument();
});
