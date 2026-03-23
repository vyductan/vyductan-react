import React from "react";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { SidebarMenuButton, SidebarProvider } from "./index";

globalThis.React = React;

Object.defineProperty(globalThis, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => void 0,
    removeEventListener: () => void 0,
    addListener: () => void 0,
    removeListener: () => void 0,
    dispatchEvent: () => false,
  }),
});

describe("SidebarMenuButton", () => {
  test("renders a tooltip-enabled menu button inside SidebarProvider without throwing", () => {
    expect(() => {
      render(
        <SidebarProvider>
          <SidebarMenuButton tooltip="Settings" data-testid="sidebar-menu-button">
            <span>Settings</span>
          </SidebarMenuButton>
        </SidebarProvider>,
      );
    }).not.toThrow();

    expect(screen.getByTestId("sidebar-menu-button")).toBeInTheDocument();
  });
});
