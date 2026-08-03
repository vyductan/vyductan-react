import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { App } from "../app";
import { Button } from "../button";
import { Drawer } from "../drawer";
import { Modal } from "./modal";

// Regression: Guide-Reservations flow = vaul Drawer > radix-ui Modal >
// `modal.warning()` (another radix-ui Modal). The Drawer and the Modals live in
// SEPARATE DismissableLayer stacks, so dismissing the top warning used to also
// collapse the Drawer (and everything inside). The Drawer now guards against
// dismissing while a Radix dialog is stacked above it. Runs in a real browser
// (Storybook + Vitest chromium) because jsdom can't exercise the two dismiss
// systems.
const meta = {
  title: "Components/Modal/CascadeRegression",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function ThreeLayer() {
  const { modal } = App.useApp();
  const [drawerOpen, setDrawerOpen] = React.useState(true);
  const [modalOpen, setModalOpen] = React.useState(true);
  return (
    <Drawer open={drawerOpen} onOpenChange={setDrawerOpen} title="drawer">
      <div data-testid="drawer-marker">drawer body</div>
      <Modal open={modalOpen} onOpenChange={setModalOpen} title="Select Time">
        <div data-testid="modal-marker">select-time body</div>
        <Button
          onClick={() =>
            modal.warning({
              title: "Time Frame Overlap",
              content: <span data-testid="warning-marker">overlaps</span>,
            })
          }
        >
          trigger-overlap
        </Button>
      </Modal>
    </Drawer>
  );
}

const seen = (id: string) => within(document.body).queryByTestId(id) !== null;

export const CloseWarningKeepsDrawerAndModal: Story = {
  render: () => (
    <App>
      <ThreeLayer />
    </App>
  ),
  play: async ({ step }) => {
    const body = within(document.body);
    const openWarning = async () => {
      await userEvent.click(await body.findByText("trigger-overlap"));
      await waitFor(() => expect(seen("warning-marker")).toBe(true));
    };
    const expectOnlyWarningClosed = async () => {
      await waitFor(() => expect(seen("warning-marker")).toBe(false));
      await expect(seen("modal-marker")).toBe(true);
      await expect(seen("drawer-marker")).toBe(true);
    };

    await waitFor(() => expect(seen("drawer-marker")).toBe(true));
    await expect(seen("modal-marker")).toBe(true);

    // Escape closes ONLY the warning (App window-capture handler wins the race
    // against the drawer's Escape and stops it collapsing the stack).
    await step("Escape", async () => {
      await openWarning();
      await userEvent.keyboard("{Escape}");
      await expectOnlyWarningClosed();
    });

    // Backdrop click closes ONLY the warning (Drawer onInteractOutside guard).
    await step("backdrop", async () => {
      await openWarning();
      const overlays = document.querySelectorAll(
        "[data-slot='dialog-overlay']",
      );
      await userEvent.click(overlays[overlays.length - 1] as HTMLElement);
      await expectOnlyWarningClosed();
    });
  },
};
