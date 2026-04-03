import React from "react";

import "@testing-library/jest-dom/vitest";

import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { Popover } from "./index";

globalThis.React = React;

globalThis.ResizeObserver ??= class ResizeObserver {
  observe() {
    return;
  }

  unobserve() {
    return;
  }

  disconnect() {
    return;
  }
};

describe("Popover", () => {
  test("renders arrow popover content without throwing when opened", () => {
    expect(() => {
      render(
        <Popover open content={<div>Content</div>}>
          <button type="button">Trigger</button>
        </Popover>,
      );
    }).not.toThrow();

    expect(screen.getByText("Content")).toBeInTheDocument();
  });
});
