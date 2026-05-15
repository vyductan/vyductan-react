import React from "react";

import "@testing-library/jest-dom/vitest";

import { cleanup, render } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
} from "./index";

const originalReact = globalThis.React;
const originalResizeObserver = globalThis.ResizeObserver;

beforeAll(() => {
  globalThis.React = React;
  globalThis.ResizeObserver ??= class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

afterEach(cleanup);

afterAll(() => {
  globalThis.React = originalReact;
  globalThis.ResizeObserver = originalResizeObserver;
});

describe("Tooltip styles", () => {
  test("applies semantic styles to the titled tooltip content and arrow", () => {
    render(
      <Tooltip
        open
        title="Styled tooltip"
        styles={{
          title: {
            maxWidth: 240,
            backgroundColor: "rgb(1, 2, 3)",
          },
          arrow: {
            backgroundColor: "rgb(4, 5, 6)",
          },
        }}
      >
        <button type="button">Open tooltip</button>
      </Tooltip>,
    );

    const content = document.querySelector('[data-slot="tooltip-content"]');

    expect(content).toHaveTextContent("Styled tooltip");
    expect(content).toHaveStyle({
      maxWidth: "240px",
      backgroundColor: "rgb(1, 2, 3)",
    });
    expect(content?.querySelector('[data-slot="tooltip-arrow"]')).toHaveStyle({
      backgroundColor: "rgb(4, 5, 6)",
    });
  });

  test("applies semantic styles to the composable tooltip content arrow", () => {
    render(
      <TooltipProvider>
        <TooltipRoot open>
          <TooltipTrigger>Open content</TooltipTrigger>
          <TooltipContent
            style={{ color: "rgb(7, 8, 9)" }}
            styles={{
              arrow: {
                backgroundColor: "rgb(10, 11, 12)",
              },
            }}
          >
            Composable tooltip
          </TooltipContent>
        </TooltipRoot>
      </TooltipProvider>,
    );

    const content = document.querySelector('[data-slot="tooltip-content"]');

    expect(content).toHaveTextContent("Composable tooltip");
    expect(content).toHaveStyle({ color: "rgb(7, 8, 9)" });
    expect(content?.querySelector('[data-slot="tooltip-arrow"]')).toHaveStyle({
      backgroundColor: "rgb(10, 11, 12)",
    });
  });
});
