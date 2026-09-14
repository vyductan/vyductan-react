import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { Button } from "../button";
import { Modal } from "../modal";
import { Popover } from "../popover";
import { Select } from "../select";
import { Drawer } from "./drawer";

import BasicDemo from "./examples/basic";
import FormDemo from "./examples/form";
import ResizableDemo from "./examples/resizable";

const meta = {
  title: "Components/Drawer",
  component: BasicDemo,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof BasicDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {};

export const FormInDrawer: Story = {
  render: () => <FormDemo />,
};

export const Resizable: Story = {
  render: () => <ResizableDemo />,
};

/**
 * Reported from the operator dashboard as a hint: Escape may not dismiss the
 * standard (non-composable) Drawer. This pins the actual behaviour.
 */
export const EscapeDismisses: Story = {
  render: () => {
    const EscapeHarness = () => {
      const [open, setOpen] = useState(false);

      return (
        <>
          <Button onClick={() => setOpen(true)}>Open drawer</Button>
          <Drawer open={open} title="Escape me" onClose={() => setOpen(false)}>
            <Button>Body control</Button>
          </Drawer>
        </>
      );
    };

    return <EscapeHarness />;
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);

    await step("open it", async () => {
      await userEvent.click(canvas.getByRole("button", { name: /open drawer/i }));
      await waitFor(() => expect(body.getByText("Escape me")).toBeVisible());
    });

    await step("Escape closes it", async () => {
      await userEvent.keyboard("{Escape}");
      await waitFor(() => expect(body.queryByText("Escape me")).toBeNull());
    });
  },
};

/**
 * vaul defaults `autoFocus` to false, so an open Drawer does NOT pull focus —
 * which leaves focus outside an open modal (an a11y problem, and the reason a
 * parked Popover keeps the caret). The prop passes straight through, so a call
 * site that wants the modal to own focus can ask for it. Pinned here because
 * flipping the library default would change every drawer on touch devices,
 * where vaul turns it off to keep the keyboard shut.
 */
export const AutoFocusMovesFocusIntoTheDrawer: Story = {
  render: () => {
    const FocusHarness = () => {
      const [open, setOpen] = useState(false);

      return (
        <>
          <Button onClick={() => setOpen(true)}>Open drawer</Button>
          <Drawer
            open={open}
            autoFocus
            title="Focus me"
            onClose={() => setOpen(false)}
          >
            <Button>Body control</Button>
          </Drawer>
        </>
      );
    };

    return <FocusHarness />;
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);

    await step("open it", async () => {
      await userEvent.click(canvas.getByRole("button", { name: /open drawer/i }));
      await waitFor(() => expect(body.getByText("Focus me")).toBeVisible());
    });

    await step("focus lands inside the drawer panel", async () => {
      await waitFor(() =>
        expect(
          document.activeElement?.closest("[data-slot='drawer-content']"),
        ).not.toBeNull(),
      );
    });

    // Leave the page clean: an open modal drawer keeps `pointer-events: none`
    // on the body, and stories in a file share the browser page.
    await step("close it again", async () => {
      await userEvent.keyboard("{Escape}");
      await waitFor(() => expect(body.queryByText("Focus me")).toBeNull());
    });
  },
};

/**
 * Reported from the operator dashboard: Escape while a Select opened inside the
 * Drawer is open closes the select AND the drawer. Their repro nests it —
 * Drawer > Popover > Select — so this pins that exact shape.
 */
export const EscapeWithASelectInsideStaysOpen: Story = {
  render: () => {
    const NestedHarness = () => {
      const [open, setOpen] = useState(false);

      return (
        <>
          <Button onClick={() => setOpen(true)}>Open drawer</Button>
          <Drawer open={open} title="Nested layers" onClose={() => setOpen(false)}>
            <Popover
              trigger="click"
              content={
                <Select
                  placeholder="Pick one"
                  options={[
                    { label: "First", value: "1" },
                    { label: "Second", value: "2" },
                  ]}
                />
              }
            >
              <Button>Open inner popover</Button>
            </Popover>
          </Drawer>
        </>
      );
    };

    return <NestedHarness />;
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);

    await step("drawer → popover → select, all open", async () => {
      await userEvent.click(canvas.getByRole("button", { name: /open drawer/i }));
      await waitFor(() => expect(body.getByText("Nested layers")).toBeVisible());

      await userEvent.click(body.getByRole("button", { name: /open inner popover/i }));
      const selectTrigger = await waitFor(() => {
        const node = document.querySelector("[data-slot='select-trigger']");
        expect(node).not.toBeNull();
        return node as Element;
      });
      await userEvent.click(selectTrigger);
      await waitFor(() =>
        expect(
          document.querySelector("[data-slot='select-content'][data-state='open']"),
        ).not.toBeNull(),
      );
    });

    await step("Escape closes the select and leaves the drawer", async () => {
      await userEvent.keyboard("{Escape}");

      await waitFor(() =>
        expect(
          document.querySelector("[data-slot='select-content'][data-state='open']"),
        ).toBeNull(),
      );
      expect(body.queryByText("Nested layers")).not.toBeNull();
    });
  },
};

/**
 * Found in the operator dashboard: a Drawer opened from INSIDE a Modal could not
 * be closed at all — not by Escape, not by its close button — because every
 * close path funnels through the same guard, and the guard answered "a dialog is
 * open, stand down" without asking whether that dialog was above the drawer or
 * the thing that opened it.
 */
export const OpenedFromInsideAModalStillCloses: Story = {
  render: () => {
    const ModalThenDrawer = () => {
      const [modalOpen, setModalOpen] = useState(true);
      const [drawerOpen, setDrawerOpen] = useState(false);

      return (
        <Modal open={modalOpen} onOpenChange={setModalOpen} title="Booking">
          <Button onClick={() => setDrawerOpen(true)}>Open drawer</Button>
          <Drawer
            open={drawerOpen}
            title="Drawer from a modal"
            onClose={() => setDrawerOpen(false)}
          >
            <Button>Body control</Button>
          </Drawer>
        </Modal>
      );
    };

    return <ModalThenDrawer />;
  },
  play: async ({ step }) => {
    const body = within(document.body);

    await step("open the drawer from inside the modal", async () => {
      await userEvent.click(body.getByRole("button", { name: /open drawer/i }));
      await waitFor(() =>
        expect(body.getByText("Drawer from a modal")).toBeVisible(),
      );
    });

    await step("its close button closes it, modal stays", async () => {
      await userEvent.click(body.getByRole("button", { name: "Close" }));
      await waitFor(() =>
        expect(body.queryByText("Drawer from a modal")).toBeNull(),
      );
      expect(body.queryByText("Booking")).not.toBeNull();
    });
  },
};
