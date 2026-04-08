import React from "react";

import "@testing-library/jest-dom/vitest";

import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { AlertModal } from "./alert-modal";

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

describe("AlertModal", () => {
  test('applies danger styling to the confirm action when okType="danger"', () => {
    render(
      React.createElement(AlertModal, {
        open: true,
        title: "Delete item",
        description: "This action cannot be undone.",
        okText: "Delete",
        okType: "danger",
      }),
    );

    const confirmButton = screen.getByRole("button", { name: "Delete" });

    expect(confirmButton).toHaveClass("border-red-600");
    expect(confirmButton).toHaveClass("bg-red-600");
  });
});
