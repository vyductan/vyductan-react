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
  test("renders automatic required indicators for schema-required labels", () => {
    const { container } = render(<ShadcnDemo />);

    expect(screen.getByText("Team Size")).toBeInTheDocument();
    expect(
      container.querySelector("#form-rhf-complex-teamSize"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Choose the team size for your workspace."),
    ).toBeInTheDocument();

    const usernameLabel = screen.getByText("Username").closest("label");
    const passwordLabel = screen.getByText("Password").closest("label");
    const billingPeriodLabel = screen.getByText("Billing Period").closest("label");
    const teamSizeLabel = screen.getByText("Team Size").closest("label");

    expect(usernameLabel).toHaveTextContent("Username*");
    expect(passwordLabel).toHaveTextContent("Password*");
    expect(billingPeriodLabel).toHaveTextContent("Billing Period*");
    expect(teamSizeLabel).toHaveTextContent("Team Size*");
  });
});
