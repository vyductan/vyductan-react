import "@testing-library/jest-dom/vitest";

import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import BasicShadcnDemo from "./basic-shadcn";

globalThis.ResizeObserver ??= class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe("Form basic shadcn demo", () => {
  test("renders the same payment fields as the basic form example", () => {
    render(<BasicShadcnDemo />);

    expect(screen.getByLabelText(/name on card/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/card number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/month/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/year/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cvv/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/payment time/i)).toHaveAttribute(
      "type",
      "time",
    );
    expect(screen.getByLabelText(/soft limit \/ pax/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/hard limit \/ pax/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/same as shipping address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/comments/i)).toBeInTheDocument();
    expect(
      screen.getByText(/soft limit must be less than or equal to/i),
    ).toBeInTheDocument();
  });
});
