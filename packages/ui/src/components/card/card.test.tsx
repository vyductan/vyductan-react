import React from "react";

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./index";

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

    expect(root).toHaveClass("gap-0");
    expect(root).not.toHaveClass("gap-4");
    expect(root).not.toHaveClass("gap-3");
    expect(root).toHaveClass("overflow-hidden");
    expect(root).toHaveClass("rounded-xl");
    expect(root).toHaveClass("py-0");
    expect(root).toHaveClass("text-sm");

    expect(header).toHaveClass("gap-0.5");
    expect(header).toHaveClass("rounded-t-xl");
    expect(header).toHaveClass("p-4");
    expect(header).toHaveClass("pb-2");
    expect(header).not.toHaveClass("px-4");

    expect(title).toHaveClass("text-base");
    expect(title).toHaveClass("leading-snug");
    expect(title).toHaveClass("font-medium");

    expect(content).toHaveClass("p-4");
    expect(content).toHaveClass("pt-0");
    expect(content).not.toHaveClass("px-4");

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

    expect(screen.getByTestId("card-root")).toHaveClass("gap-0", "py-0");
    expect(screen.getByTestId("card-header")).toHaveClass("gap-0.5", "p-3", "pb-2");
    expect(screen.getByTestId("card-title")).toHaveClass("text-sm");
    expect(screen.getByTestId("card-content")).toHaveClass("p-3", "pt-0");
    expect(screen.getByTestId("card-footer")).toHaveClass("p-3");
    expect(screen.getByTestId("card-footer")).toHaveClass(
      "group-data-[size=small]/card:p-3",
    );
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

  test("keeps slot padding stable when header and footer render their own borders", () => {
    cleanup();

    render(
      <Card data-testid="card-root">
        <CardHeader className="border-b" data-testid="card-header">
          <CardTitle>Account settings</CardTitle>
        </CardHeader>
        <CardContent data-testid="card-content">Body</CardContent>
        <CardFooter className="border-t" data-testid="card-footer">
          Actions
        </CardFooter>
      </Card>,
    );

    const header = screen.getByTestId("card-header");
    const content = screen.getByTestId("card-content");
    const footer = screen.getByTestId("card-footer");

    expect(header).toHaveClass("p-4");
    expect(header.className).not.toContain("[.border-b]:pb-6");
    expect(content).toHaveClass("p-4", "pt-0");
    expect(content.className).toContain("peer-[.border-b]/card-header:pt-4");
    expect(footer).toHaveClass("p-4");
    expect(footer.className).not.toContain("[.border-t]:pt-6");
  });

  test("applies classNames hooks to composed header and content slots", () => {
    cleanup();

    render(
      <Card
        classNames={{
          header: "card-header-tight",
          content: "card-content-tight",
        }}
      >
        <CardHeader data-testid="card-header">
          <CardTitle>Account settings</CardTitle>
        </CardHeader>
        <CardContent data-testid="card-content">Body</CardContent>
      </Card>,
    );

    expect(screen.getByTestId("card-header")).toHaveClass("card-header-tight");
    expect(screen.getByTestId("card-content")).toHaveClass("card-content-tight");
  });

  test("exposes the shadcn image-card root and header hooks needed for image-first composition", () => {
    cleanup();

    render(
      <Card size="small" data-testid="card-root">
        <figure data-testid="card-figure">
          <img
            data-testid="card-image"
            alt="Event cover"
            src="https://example.com/cover.png"
          />
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
    expect(root).toHaveClass("py-0");
    expect(header).toHaveClass("group/card-header");
  });
});
