import { useState } from "react";
import { userEvent } from "vitest/browser";
import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

import { Button } from "../button";
import { Popover } from "../popover";
import { Drawer } from "./drawer";

// Runs in the `browser` project: `userEvent` here is Playwright-backed, so the
// keypress travels the browser's own input pipeline rather than being dispatched
// at the DOM. Storybook play functions and jsdom both use synthetic events, so
// neither can tell whether real key delivery reaches these layers at all.

const drawerPanel = () =>
  document.querySelector("[data-slot='drawer-content']");
const openPopovers = () =>
  [...document.querySelectorAll("[data-slot='popover-content']")].filter(
    (node) => node.getAttribute("data-state") === "open",
  );

afterEach(() => document.body.replaceChildren());

describe("Escape from a real keypress", () => {
  test("closes the drawer", async () => {
    const Harness = () => {
      const [open, setOpen] = useState(true);

      return (
        <Drawer open={open} title="Real keys" onClose={() => setOpen(false)}>
          <Button>Body control</Button>
        </Drawer>
      );
    };
    render(<Harness />);
    await waitFor(() => expect(drawerPanel()).not.toBeNull());

    await userEvent.keyboard("{Escape}");

    await waitFor(() => expect(drawerPanel()).toBeNull());
  });

  test("closes the drawer while leaving a popover parked behind it", async () => {
    const Harness = () => {
      const [drawerOpen, setDrawerOpen] = useState(false);

      return (
        <>
          <Popover
            trigger="click"
            content={
              <Button onClick={() => setDrawerOpen(true)}>Assign job</Button>
            }
          >
            <Button>Open jobs list</Button>
          </Popover>
          <Drawer
            open={drawerOpen}
            title="Assign Guide to Job"
            onClose={() => setDrawerOpen(false)}
          >
            <Button>A control inside the drawer</Button>
          </Drawer>
        </>
      );
    };
    render(<Harness />);

    await userEvent.click(screen.getByRole("button", { name: "Open jobs list" }));
    await waitFor(() => expect(openPopovers()).toHaveLength(1));
    await userEvent.click(screen.getByRole("button", { name: "Assign job" }));
    await waitFor(() => expect(drawerPanel()).not.toBeNull());

    await userEvent.keyboard("{Escape}");

    await waitFor(() => expect(drawerPanel()).toBeNull());
    expect(openPopovers()).toHaveLength(1);
  });
});
