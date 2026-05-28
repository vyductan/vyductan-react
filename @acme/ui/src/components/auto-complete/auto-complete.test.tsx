import "@testing-library/jest-dom/vitest";

import * as React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

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

Element.prototype.scrollIntoView ??= () => {
  return;
};

afterEach(() => {
  cleanup();
});

describe("AutoComplete", () => {
  test("combobox trigger uses primary focus border state", () => {
    render(
      React.createElement(AutoComplete, {
        placeholder: "Choose a role",
        options: [
          { label: "Administrator", value: 1 },
          { label: "Editor", value: 2 },
        ],
      }),
    );

    const trigger = screen.getByRole("combobox");

    expect(trigger).toHaveClass("focus:border-primary-500");
    expect(trigger).toHaveClass("focus:ring-primary-500/20");
    expect(trigger).toHaveClass("focus-visible:border-primary-500");
    expect(trigger).toHaveClass("focus-visible:ring-primary-500/20");
  });

  test("open combobox trigger keeps primary border state after focus moves into popover", () => {
    render(
      React.createElement(AutoComplete, {
        open: true,
        placeholder: "Choose a role",
        options: [
          { label: "Administrator", value: 1 },
          { label: "Editor", value: 2 },
        ],
      }),
    );

    const trigger = screen
      .getAllByRole("combobox", { expanded: true })
      .find((element) => element.tagName === "BUTTON");

    expect(trigger).toHaveClass("border-primary-500");
    expect(trigger).toHaveClass("ring-[3px]");
    expect(trigger).toHaveClass("ring-primary-500/20");
  });

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
