import "@testing-library/jest-dom/vitest";

import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import ShadcnDemo from "./shadcn";

globalThis.ResizeObserver ??= class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe("Form shadcn demo", () => {
  test("renders a team size field backed by Select options", () => {
    const { container } = render(<ShadcnDemo />);

    expect(screen.getByText("Team Size")).toBeInTheDocument();
    expect(
      container.querySelector("#form-rhf-complex-teamSize"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Choose the team size for your workspace."),
    ).toBeInTheDocument();
  });
});
