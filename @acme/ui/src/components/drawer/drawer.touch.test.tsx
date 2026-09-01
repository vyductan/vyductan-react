import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import { Drawer } from "./index";

// Runs in the `touch` vitest project: a Chromium context created with
// `hasTouch: true`, which is what makes `any-pointer: fine` stop matching.
// The companion assertion lives in drawer.test.tsx (jsdom), where the grip IS
// rendered — together they prove the gate is conditional, not a blanket hide.

test("the context really has no fine pointer", () => {
  expect(matchMedia("(any-pointer: fine)").matches).toBe(false);
  expect(matchMedia("(any-pointer: coarse)").matches).toBe(true);
});

test("resize grip is hidden, and out of the a11y tree, without a fine pointer", () => {
  render(
    <Drawer open resizable title="Title">
      <div>Body</div>
    </Drawer>,
  );

  const grip = document.querySelector<HTMLElement>(
    "[data-slot='drawer-resize-handle']",
  );

  expect(grip).not.toBeNull();
  expect(getComputedStyle(grip!).display).toBe("none");
  expect(
    screen.queryByRole("separator", { name: "Resize drawer" }),
  ).toBeNull();
});

test("the drawer itself still renders — only the grip is gated", () => {
  render(
    <Drawer open resizable title="Title">
      <div>Body</div>
    </Drawer>,
  );

  expect(screen.getAllByText("Body")[0]).toBeVisible();
});
