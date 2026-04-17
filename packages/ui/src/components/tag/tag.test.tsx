import React from "react";

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

import { ConfigProvider } from "../config-provider";
import { Tag } from "./tag";

globalThis.React = React;

afterEach(() => {
  cleanup();
});

function renderTag(
  properties: React.ComponentProps<typeof Tag> = {},
  children: React.ReactNode = "Tag",
) {
  return render(<Tag {...properties}>{children}</Tag>);
}

describe("Tag", () => {
  test("renders filled blue with a transparent border", () => {
    renderTag({ variant: "filled", color: "blue" });

    expect(screen.getByText("Tag")).toHaveClass(
      "bg-blue-100",
      "text-blue-700",
      "border-transparent",
    );
    expect(screen.getByText("Tag")).not.toHaveClass("border-blue-200");
  });

  test("renders solid purple with the colorful family classes", () => {
    renderTag({ variant: "solid", color: "purple" });

    expect(screen.getByText("Tag")).toHaveClass(
      "bg-purple-600",
      "text-white",
      "border-purple-600",
    );
  });

  test("renders outlined lime with the colorful family classes", () => {
    renderTag({ variant: "outlined", color: "lime" });

    expect(screen.getByText("Tag")).toHaveClass(
      "bg-lime-50",
      "text-lime-700",
      "border-lime-300",
    );
  });

  test("renders default lime with the legacy named color classes", () => {
    renderTag({ color: "lime" });

    expect(screen.getByText("Tag")).toHaveClass(
      "bg-lime-100",
      "text-lime-700",
      "border-lime-300",
    );
  });

  test("keeps legacy outline default text foreground styling", () => {
    renderTag({ variant: "outline", color: "default" });

    expect(screen.getByText("Tag")).toHaveClass("text-foreground");
  });

  test("uses color-mix styles for hex filled, outlined, and solid tags", () => {
    const { rerender } = render(
      <Tag variant="filled" color="#4f46e5">
        Filled
      </Tag>,
    );

    expect(screen.getByText("Filled")).toHaveAttribute(
      "style",
      expect.stringContaining("color-mix"),
    );
    expect(screen.getByText("Filled")).not.toHaveAttribute(
      "style",
      expect.stringContaining("border-color"),
    );

    rerender(
      <Tag variant="outlined" color="#4f46e5">
        Outlined
      </Tag>,
    );

    expect(screen.getByText("Outlined")).toHaveAttribute(
      "style",
      expect.stringContaining("color-mix"),
    );

    rerender(
      <Tag variant="solid" color="#4f46e5">
        Solid
      </Tag>,
    );

    expect(screen.getByText("Solid")).toHaveStyle({
      backgroundColor: "#4f46e5",
      borderColor: "#4f46e5",
      color: "#fff",
    });
  });

  test("falls back to legacy success styling with a transparent border for filled tags", () => {
    renderTag({ variant: "filled", color: "success" });

    expect(screen.getByText("Tag")).toHaveClass(
      "bg-green-100",
      "text-green-700",
      "border-transparent",
    );
    expect(screen.getByText("Tag")).not.toHaveClass("border-green-300");
  });

  test("reads ConfigProvider tag defaults for filled lime tags", () => {
    render(
      <ConfigProvider tag={{ variant: "filled", color: "lime" }}>
        <Tag>Configured</Tag>
      </ConfigProvider>,
    );

    expect(screen.getByText("Configured")).toHaveClass(
      "bg-lime-100",
      "text-lime-700",
      "border-transparent",
    );
    expect(screen.getByText("Configured")).not.toHaveClass("border-lime-200");
  });

  test("applies ConfigProvider tag styles to rendered tags", () => {
    render(
      <ConfigProvider
        tag={{
          style: { letterSpacing: "0.2em" },
          variant: "filled",
          color: "lime",
        }}
      >
        <Tag>Configured style</Tag>
      </ConfigProvider>,
    );

    expect(screen.getByText("Configured style")).toHaveStyle({
      letterSpacing: "0.2em",
    });
  });

  test("merges consumer style with computed hex styles", () => {
    render(
      <Tag variant="solid" color="#4f46e5" style={{ letterSpacing: "0.2em" }}>
        Styled hex
      </Tag>,
    );

    expect(screen.getByText("Styled hex")).toHaveStyle({
      backgroundColor: "#4f46e5",
      borderColor: "#4f46e5",
      color: "#fff",
      letterSpacing: "0.2em",
    });
  });
});
