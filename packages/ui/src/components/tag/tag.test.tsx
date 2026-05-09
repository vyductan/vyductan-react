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
  test("renders default tags as filled gray tags", () => {
    renderTag();

    expect(screen.getByText("Tag")).toHaveClass(
      "bg-gray-100",
      "text-foreground",
      "border-transparent",
    );
    expect(screen.getByText("Tag")).not.toHaveClass("bg-primary");
  });

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

  test("renders color-only lime tags as filled lime tags", () => {
    renderTag({ color: "lime" });

    expect(screen.getByText("Tag")).toHaveClass(
      "bg-lime-100",
      "text-lime-700",
      "border-transparent",
    );
  });

  test("falls back to filled styling for unsupported legacy variant strings", () => {
    renderTag({
      variant: "default" as React.ComponentProps<typeof Tag>["variant"],
      color: "default",
    });

    expect(screen.getByText("Tag")).toHaveClass(
      "bg-gray-100",
      "text-foreground",
      "border-transparent",
    );
    expect(screen.getByText("Tag")).not.toHaveClass("bg-primary");
  });

  test("renders Tailwind-only preset colors", () => {
    const { rerender } = renderTag({ color: "slate" });

    expect(screen.getByText("Tag")).toHaveClass(
      "bg-slate-100",
      "text-slate-700",
      "border-transparent",
    );

    rerender(
      <Tag variant="solid" color="emerald">
        Tag
      </Tag>,
    );

    expect(screen.getByText("Tag")).toHaveClass(
      "bg-emerald-600",
      "text-white",
      "border-emerald-600",
    );

    rerender(
      <Tag variant="outlined" color="stone">
        Tag
      </Tag>,
    );

    expect(screen.getByText("Tag")).toHaveClass(
      "bg-stone-50",
      "text-stone-700",
      "border-stone-300",
    );
  });

  test("renders Ant Design-only preset colors", () => {
    const { rerender } = renderTag({ color: "magenta" });

    expect(screen.getByText("Tag")).toHaveClass(
      "bg-pink-100",
      "text-pink-700",
      "border-transparent",
    );

    rerender(
      <Tag variant="solid" color="geekblue">
        Tag
      </Tag>,
    );

    expect(screen.getByText("Tag")).toHaveClass(
      "bg-indigo-600",
      "text-white",
      "border-indigo-600",
    );

    rerender(
      <Tag variant="outlined" color="volcano">
        Tag
      </Tag>,
    );

    expect(screen.getByText("Tag")).toHaveClass(
      "bg-orange-50",
      "text-orange-700",
      "border-orange-300",
    );
  });

  test("falls back to filled default styling for unsupported named color strings", () => {
    renderTag({ color: "unknown-brand" });

    expect(screen.getByText("Tag")).toHaveClass(
      "bg-gray-100",
      "text-foreground",
      "border-transparent",
    );
    expect(screen.getByText("Tag")).not.toHaveClass("bg-primary");
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
