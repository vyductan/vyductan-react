import React from "react";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { DrawerContent, DrawerRoot } from "./index";

globalThis.React = React;

describe("DrawerContent", () => {
  test("applies touch and text selection overrides with valid utility classes", () => {
    render(
      <DrawerRoot open>
        <DrawerContent data-testid="drawer-content">
          <div>Body</div>
        </DrawerContent>
      </DrawerRoot>,
    );

    const content = screen.getByTestId("drawer-content");

    expect(content).toHaveClass("!touch-auto");
    expect(content).toHaveClass("!select-text");
    expect(content).not.toHaveClass("touch-auto!");
    expect(content).not.toHaveClass("select-text!");
  });
});
