import React from "react";

import "@testing-library/jest-dom/vitest";

import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { Typography } from "./index";

globalThis.React = React;

describe("Typography.Link", () => {
  test("renders its children and link styling classes", () => {
    render(
      <Typography.Link href="/docs">Read the docs</Typography.Link>,
    );

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
