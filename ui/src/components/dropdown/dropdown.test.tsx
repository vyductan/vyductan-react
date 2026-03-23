import React from "react";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem } from "./index";

globalThis.React = React;

describe("DropdownMenuItem", () => {
  test("applies svg icon styling hooks for default and destructive variants", () => {
    render(
      <DropdownMenu open>
        <DropdownMenuContent forceMount>
          <DropdownMenuItem data-testid="default-item">
            <svg aria-label="default icon" />
            <span>Default</span>
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" data-testid="destructive-item">
            <svg aria-label="destructive icon" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    expect(screen.getByTestId("default-item")).toHaveClass(
      "[&_svg:not([class*='text-'])]:text-muted-foreground",
    );
    expect(screen.getByTestId("destructive-item")).toHaveClass(
      "data-[variant=destructive]:*:[svg]:text-destructive",
    );
    expect(screen.getByTestId("default-item")).not.toHaveClass(
      "[&_span[role='img']:not([class*='text-'])]:text-muted-foreground",
    );
  });
});
