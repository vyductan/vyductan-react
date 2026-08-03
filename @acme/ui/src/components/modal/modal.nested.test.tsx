import React from "react";

import "@testing-library/jest-dom/vitest";

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";

import { Modal } from "./modal";

globalThis.React = React;
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

afterEach(() => cleanup());

const tick = () => new Promise((r) => setTimeout(r, 20));

// Two modal-level dialogs, nested. Closing the inner one must never close the
// outer one — Radix gates the lower layer while a modal is stacked on top.
function Fixture({
  onBaseChange = () => {},
  onNestedChange = () => {},
}: {
  onBaseChange?: (o: boolean) => void;
  onNestedChange?: (o: boolean) => void;
}) {
  const [nestedOpen, setNestedOpen] = React.useState(true);
  return (
    <Modal open onOpenChange={onBaseChange} title="base">
      <div data-testid="base-body">base</div>
      <Modal
        open={nestedOpen}
        onOpenChange={(o) => {
          setNestedOpen(o);
          onNestedChange(o);
        }}
        title="nested"
      >
        <div data-testid="nested-body">nested</div>
      </Modal>
    </Modal>
  );
}

describe("nested modal close — base must survive", () => {
  test("Escape closes only the nested modal", async () => {
    const user = userEvent.setup();
    render(<Fixture />);
    await user.keyboard("{Escape}");
    expect(screen.queryByTestId("nested-body")).not.toBeInTheDocument();
    expect(screen.getByTestId("base-body")).toBeInTheDocument();
  });

  test("clicking the nested backdrop does not ask the base to close", async () => {
    const onBaseChange = vi.fn();
    render(<Fixture onBaseChange={onBaseChange} />);
    await tick(); // Radix attaches its dismiss listener on setTimeout(0)

    const overlays = document.querySelectorAll("[data-slot='dialog-overlay']");
    const nestedOverlay = overlays[overlays.length - 1]!;
    fireEvent.pointerDown(nestedOverlay, { button: 0 });
    fireEvent.pointerUp(nestedOverlay, { button: 0 });
    fireEvent.click(nestedOverlay, { button: 0 });
    await tick();

    expect(onBaseChange).not.toHaveBeenCalledWith(false);
  });
});
