import React from "react";

import "@testing-library/jest-dom/vitest";

import type { MenuProps } from "../menu";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test } from "vitest";

import { SidebarMenuButton, SidebarProvider } from "./index";
import { Sidebar } from "./sidebar";

globalThis.React = React;

// Vitest runs without `globals`, so RTL never registers its auto-cleanup.
afterEach(cleanup);

// Radix's tooltip popper observes its trigger; jsdom ships no ResizeObserver.
Object.defineProperty(globalThis, "ResizeObserver", {
  writable: true,
  value: class {
    observe() {
      return void 0;
    }
    unobserve() {
      return void 0;
    }
    disconnect() {
      return void 0;
    }
  },
});

Object.defineProperty(globalThis, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: undefined,
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
          <SidebarMenuButton
            tooltip="Settings"
            data-testid="sidebar-menu-button"
          >
            <span>Settings</span>
          </SidebarMenuButton>
        </SidebarProvider>,
      );
    }).not.toThrow();

    expect(screen.getByTestId("sidebar-menu-button")).toBeInTheDocument();
  });
});

const items: MenuProps["items"] = [
  { key: "/dashboard", label: "Dashboard", type: "item" },
  {
    key: "/finance",
    label: "Finance",
    type: "submenu",
    children: [
      { key: "/finance", label: "Overview", type: "item" },
      { key: "/finance/budgets", label: "Budgets", type: "item" },
    ],
  },
];

const renderSidebar = (properties: Partial<React.ComponentProps<typeof Sidebar>>) =>
  render(
    <SidebarProvider>
      <Sidebar items={items} {...properties} />
    </SidebarProvider>,
  );

describe("Sidebar drilldown", () => {
  test("flat mode (default) skips submenus entirely", () => {
    renderSidebar({});

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.queryByText("Finance")).not.toBeInTheDocument();
  });

  test("clicking a submenu replaces the level with its children", async () => {
    const user = userEvent.setup();
    renderSidebar({ mode: "drilldown" });

    await user.click(screen.getByText("Finance"));

    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("Budgets")).toBeInTheDocument();
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
  });

  test("back row returns to the parent level", async () => {
    const user = userEvent.setup();
    renderSidebar({ mode: "drilldown" });

    await user.click(screen.getByText("Finance"));
    // The back row is labelled with the level you are inside.
    await user.click(screen.getByRole("button", { name: "Back to Finance" }));

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.queryByText("Budgets")).not.toBeInTheDocument();
  });

  test("a selected key inside a submenu opens that level on first render", () => {
    renderSidebar({
      mode: "drilldown",
      selectedKeys: ["/finance/budgets"],
    });

    expect(screen.getByText("Budgets")).toBeInTheDocument();
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
  });

  test("openKeys is controllable and reports changes", async () => {
    const user = userEvent.setup();
    const seen: string[][] = [];

    renderSidebar({
      mode: "drilldown",
      openKeys: [],
      onOpenChange: (next) => seen.push(next),
    });

    await user.click(screen.getByText("Finance"));

    // Controlled: the parent decides, so the level must not move on its own.
    expect(seen).toEqual([["/finance"]]);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });
});
