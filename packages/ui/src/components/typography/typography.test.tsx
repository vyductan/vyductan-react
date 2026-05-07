import React from "react";

import "@testing-library/jest-dom/vitest";

import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { Typography, TypographyCurrency } from "./index";

globalThis.React = React;

describe("Typography.Link", () => {
  test("renders its children and link styling classes", () => {
    render(<Typography.Link href="/docs">Read the docs</Typography.Link>);

    const link = screen.getByRole("link", { name: "Read the docs" });

    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/docs");
    expect(link).toHaveClass(
      "font-medium",
      "text-primary",
      "underline",
      "underline-offset-4",
    );
  });
});

describe("TypographyCurrency", () => {
  test("renders already-formatted currency with tabular number styling", () => {
    render(<TypographyCurrency>1,234,567 ₫</TypographyCurrency>);

    const currency = screen.getByText("1,234,567 ₫");

    expect(currency).toHaveClass("tabular-nums", "font-features-['tnum']");
  });

  test("preserves caller className and merges caller style after defaults", () => {
    render(
      <TypographyCurrency
        className="text-right"
        style={{ fontVariantNumeric: "normal", letterSpacing: "0.02em" }}
      >
        9,876,543 ₫
      </TypographyCurrency>,
    );

    const currency = screen.getByText("9,876,543 ₫");

    expect(currency).toHaveClass("tabular-nums", "font-features-['tnum']", "text-right");
    expect(currency).toHaveStyle({
      fontVariantNumeric: "normal",
      letterSpacing: "0.02em",
    });
  });

  test("is also available as Typography.Currency", () => {
    render(<Typography.Currency strong>2,468,000 ₫</Typography.Currency>);

    const currency = screen.getByText("2,468,000 ₫");

    expect(currency).toHaveClass("tabular-nums", "font-features-['tnum']", "font-semibold");
  });
});
