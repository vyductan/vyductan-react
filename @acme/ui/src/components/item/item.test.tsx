import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";

import { Item, ItemContent, ItemDescription } from "./index";

afterEach(() => {
  cleanup();
});

// `xs` lives in this wrapper, not in shadcn/item.tsx: the size must reach the
// DOM as data-size AND must not carry the default size's `gap-4 p-4` with it.

const renderItem = (size?: "default" | "sm" | "xs") =>
  render(
    <Item size={size} data-testid="item">
      <ItemContent>
        <ItemDescription>desc</ItemDescription>
      </ItemContent>
    </Item>,
  );

test("xs sets data-size and drops the default size classes", () => {
  renderItem("xs");
  const item = screen.getByTestId("item");

  expect(item).toHaveAttribute("data-size", "xs");
  expect(item).toHaveClass("gap-2", "px-2.5", "py-2");
  expect(item.className).not.toMatch(/\bp-4\b|\bgap-4\b/);
});

test("xs scales the child slots down", () => {
  renderItem("xs");
  const item = screen.getByTestId("item");

  expect(item).toHaveClass(
    "[&_[data-slot=item-content]]:gap-0",
    "[&_[data-slot=item-description]]:text-xs",
  );
});

test("other sizes pass straight through to shadcn", () => {
  const { rerender } = renderItem("sm");
  expect(screen.getByTestId("item")).toHaveAttribute("data-size", "sm");
  expect(screen.getByTestId("item")).toHaveClass("px-4", "py-3");

  rerender(<Item size="default" data-testid="item" />);
  expect(screen.getByTestId("item")).toHaveAttribute("data-size", "default");
  expect(screen.getByTestId("item")).toHaveClass("p-4", "gap-4");
});

test("variant still reaches shadcn when size is xs", () => {
  render(<Item size="xs" variant="outline" data-testid="item" />);
  const item = screen.getByTestId("item");

  expect(item).toHaveAttribute("data-variant", "outline");
  expect(item).toHaveClass("border-border");
});
