import React from "react";

import "@testing-library/jest-dom/vitest";

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

import { Button } from "../button";
import { Modal } from "./modal";

afterEach(() => cleanup());

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

describe("Modal", () => {
  test("applies a responsive max-width override when width is provided", () => {
    render(
      React.createElement(
        Modal,
        { open: true, width: 800, title: "Custom Width Modal" },
        React.createElement("div", undefined, "Body"),
      ),
    );

    const content = screen.getByRole("dialog");

    expect(content).toHaveClass("w-(--modal-width)");
    expect(content).toHaveClass("sm:max-w-(--modal-width)");
    expect(content).not.toHaveClass("sm:max-w-auto");
  });

  test("wraps fragment descriptions with DialogDescription", () => {
    render(
      <Modal
        open
        title="Per-pax limits"
        description={
          <>
            Configure per-pax limits for{" "}
            <span className="text-foreground font-medium">Food</span>.
          </>
        }
      >
        Body
      </Modal>,
    );

    const categoryName = screen.getByText("Food");
    const description = categoryName.closest(
      '[data-slot="dialog-description"]',
    );

    expect(description).toBeInTheDocument();
    expect(description).toHaveTextContent("Configure per-pax limits for Food.");
  });

  // Regression: a disabled trigger must not open the modal. The Button used
  // `loading ?? disabled`, so `loading={false}` discarded `disabled` and the
  // native disabled attribute was dropped, letting the Radix trigger fire.
  test.each([
    { name: "disabled", node: <Button disabled>Open</Button> },
    {
      name: "disabled + loading={false}",
      node: (
        <Button disabled loading={false}>
          Open
        </Button>
      ),
    },
  ])("disabled trigger ($name) does not open the modal", ({ node }) => {
    render(
      <Modal title="T" trigger={node}>
        Body
      </Modal>,
    );

    const trigger = screen.getByRole("button", { name: "Open" });
    expect(trigger).toBeDisabled();

    fireEvent.click(trigger);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
