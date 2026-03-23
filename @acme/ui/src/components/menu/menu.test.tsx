import React from "react";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import NestedDemo from "./demo/nested";

globalThis.React = React;

globalThis.matchMedia ??= ((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addEventListener: () => void 0,
  removeEventListener: () => void 0,
  addListener: () => void 0,
  removeListener: () => void 0,
  dispatchEvent: () => false,
})) as typeof globalThis.matchMedia;

describe("Menu nested demo", () => {
  test("renders the vertical nested menu demo without requiring external sidebar setup", () => {
    expect(() => {
      render(<NestedDemo />);
    }).not.toThrow();

    expect(screen.getByText("Navigation One")).toBeInTheDocument();
    expect(screen.getByText("Navigation Two")).toBeInTheDocument();
    expect(screen.getByText("Navigation Three")).toBeInTheDocument();
  });
});
