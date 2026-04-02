import React from "react";

import "@testing-library/jest-dom/vitest";

import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { Modal } from ".";

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
      <Modal open width={800} title="Custom Width Modal">
        <div>Body</div>
      </Modal>,
    );

    const content = screen.getByRole("dialog");

    expect(content).toHaveClass("w-(--modal-width)");
    expect(content).toHaveClass("sm:max-w-(--modal-width)");
    expect(content).not.toHaveClass("sm:max-w-auto");
  });
});
