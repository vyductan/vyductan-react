import React from "react";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from "./index";

globalThis.React = React;

describe("Card wrapper", () => {
  test("applies shadcn-like default spacing and typography classes", () => {
    render(
      <Card data-testid="card-root">
        <CardHeader data-testid="card-header">
          <CardTitle data-testid="card-title">Login to your account</CardTitle>
          <CardAction>Sign up</CardAction>
        </CardHeader>
        <CardContent data-testid="card-content">Body</CardContent>
        <CardFooter data-testid="card-footer">Actions</CardFooter>
      </Card>,
    );

    const root = screen.getByTestId("card-root");
    const header = screen.getByTestId("card-header");
    const title = screen.getByTestId("card-title");
    const content = screen.getByTestId("card-content");
    const footer = screen.getByTestId("card-footer");

    expect(root).toHaveClass("gap-4");
    expect(root).toHaveClass("overflow-hidden");
    expect(root).toHaveClass("rounded-xl");
    expect(root).toHaveClass("py-4");
    expect(root).toHaveClass("text-sm");
    expect(root).toHaveClass("has-data-[slot=card-footer]:pb-0");

    expect(header).toHaveClass("gap-1");
    expect(header).toHaveClass("rounded-t-xl");
    expect(header).toHaveClass("px-4");

    expect(title).toHaveClass("text-base");
    expect(title).toHaveClass("leading-snug");
    expect(title).toHaveClass("font-medium");

    expect(content).toHaveClass("px-4");

    expect(footer).toHaveClass("rounded-b-xl");
    expect(footer).toHaveClass("border-t");
    expect(footer).toHaveClass("bg-muted/50");
    expect(footer).toHaveClass("p-4");
  });

  test("switches to compact spacing for small size", () => {
    cleanup();

    render(
      <Card size="small" data-testid="card-root">
        <CardHeader data-testid="card-header">
          <CardTitle data-testid="card-title">Login to your account</CardTitle>
        </CardHeader>
        <CardContent data-testid="card-content">Body</CardContent>
        <CardFooter data-testid="card-footer">Actions</CardFooter>
      </Card>,
    );

    expect(screen.getByTestId("card-root")).toHaveClass("gap-3", "py-3");
    expect(screen.getByTestId("card-header")).toHaveClass("px-3");
    expect(screen.getByTestId("card-title")).toHaveClass("text-sm");
    expect(screen.getByTestId("card-content")).toHaveClass("px-3");
    expect(screen.getByTestId("card-footer")).toHaveClass("p-3");
    expect(screen.getByTestId("card-footer")).toHaveClass("group-data-[size=sm]/card:p-3");
  });

  test("treats fragment-wrapped composed children as a shadcn card", () => {
    cleanup();

    render(
      <Card data-testid="card-root">
        <>
          <CardHeader data-testid="card-header">
            <CardTitle data-testid="card-title">Project Summary</CardTitle>
          </CardHeader>
          <CardContent data-testid="card-content">Body</CardContent>
          <CardFooter data-testid="card-footer">Actions</CardFooter>
        </>
      </Card>,
    );

    const root = screen.getByTestId("card-root");
    const header = screen.getByTestId("card-header");
    const content = screen.getByTestId("card-content");
    const footer = screen.getByTestId("card-footer");

    expect(header.parentElement).toBe(root);
    expect(content.parentElement).toBe(root);
    expect(footer.parentElement).toBe(root);
  });

  test("exposes the shadcn image-card root and header hooks needed for image-first composition", () => {
    cleanup();

    render(
      <Card size="small" data-testid="card-root">
        <figure data-testid="card-figure">
          <img data-testid="card-image" alt="Event cover" src="https://example.com/cover.png" />
        </figure>
        <CardHeader data-testid="card-header">
          <CardTitle data-testid="card-title">Design systems meetup</CardTitle>
        </CardHeader>
      </Card>,
    );

    const root = screen.getByTestId("card-root");
    const figure = screen.getByTestId("card-figure");
    const image = screen.getByTestId("card-image");
    const header = screen.getByTestId("card-header");

    expect(figure.parentElement).toBe(root);
    expect(image.parentElement).toBe(figure);
    expect(root).toHaveAttribute("data-size", "small");
    expect(root).toHaveClass("group/card");
    expect(root).toHaveClass("has-[>img:first-child]:pt-0");
    expect(header).toHaveClass("group/card-header");
  });
});
