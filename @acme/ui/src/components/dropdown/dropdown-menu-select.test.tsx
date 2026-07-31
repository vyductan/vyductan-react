import React from "react";

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";

import { Dropdown } from "./index";

globalThis.React = React;

// This project has no global auto-cleanup, so an earlier render would
// otherwise leave a second "Open" button in the document.
afterEach(() => {
  cleanup();
});

// Radix needs these in jsdom.
beforeAll(() => {
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as never;
  Element.prototype.scrollIntoView ??= vi.fn();
  Element.prototype.hasPointerCapture ??= vi.fn(() => false);
  Element.prototype.setPointerCapture ??= vi.fn();
  Element.prototype.releasePointerCapture ??= vi.fn();
});

/**
 * `menu` is a MenuProps, which declares `onSelect`, and Menu honours it — so a
 * caller can reasonably wire a Dropdown that way instead of giving every item
 * its own `onClick`. Dropdown used to accept the handler and never call it,
 * which type-checks fine and leaves the menu silently dead (that is exactly how
 * the theme switcher stopped switching themes).
 */
describe("Dropdown menu handlers", () => {
  const items = [
    { key: "light", type: "item" as const, label: "Light" },
    { key: "dark", type: "item" as const, label: "Dark" },
  ];

  test("calls the menu-level onSelect with the picked key", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <Dropdown menu={{ items, onSelect }}>
        <button type="button">Open</button>
      </Dropdown>,
    );

    await user.click(screen.getByRole("button", { name: "Open" }));
    await user.click(await screen.findByRole("menuitem", { name: "Dark" }));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0]?.[0]).toMatchObject({ key: "dark" });
  });

  test("still calls a per-item onClick, and both together", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onSelect = vi.fn();

    render(
      <Dropdown
        menu={{
          items: [{ key: "light", type: "item", label: "Light", onClick }],
          onSelect,
        }}
      >
        <button type="button">Open</button>
      </Dropdown>,
    );

    await user.click(screen.getByRole("button", { name: "Open" }));
    await user.click(await screen.findByRole("menuitem", { name: "Light" }));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick.mock.calls[0]?.[0]).toMatchObject({ key: "light" });
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0]?.[0]).toMatchObject({ key: "light" });
  });
});
