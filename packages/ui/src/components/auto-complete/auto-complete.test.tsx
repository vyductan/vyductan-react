import "@testing-library/jest-dom/vitest";

import * as React from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { AutoComplete } from "./auto-complete";

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

Element.prototype.scrollIntoView ??= () => undefined;

describe("AutoComplete", () => {
  test("default filter matches numeric option values by their labels", () => {
    render(
      React.createElement(AutoComplete, {
        mode: "input",
        placeholder: "Choose a role",
        options: [
          { label: "Administrator", value: 1 },
          { label: "Editor", value: 2 },
        ],
        open: true,
        value: 2,
      }),
    );

    const input = screen.getByPlaceholderText("Choose a role");

    fireEvent.change(input, { target: { value: "edi" } });

    expect(screen.getByText("Editor")).toBeInTheDocument();
    expect(screen.queryByText("No data.")).not.toBeInTheDocument();
  });
});
