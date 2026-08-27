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

  test("lays the selected icon and label out as a flex row the label can shrink inside", () => {
    render(
      React.createElement(AutoComplete, {
        value: "GD-1041",
        options: [{ label: "Alexandra Whitfield", value: "GD-1041" }],
        optionRender: {
          icon: () =>
            React.createElement(
              "span",
              { "data-testid": "option-avatar" },
              "N",
            ),
        },
      }),
    );

    const selectionItem = screen
      .getByRole("combobox")
      .querySelector('[data-slot="select-selection-item"]');

    expect(selectionItem).toHaveClass("flex", "min-w-0", "flex-1");

    // The icon slot must not absorb the shrink a long label forces on the row.
    expect(screen.getByTestId("option-avatar").parentElement).toHaveClass(
      "inline-flex",
      "shrink-0",
      "items-center",
    );

    // text-overflow only resolves on the block that holds the text, so the
    // label — not the flex row above it — is what carries `truncate`.
    const label = screen.getByText("Alexandra Whitfield");
    expect(label).toHaveClass("truncate");
    expect(label.parentElement).toHaveClass("flex", "min-w-0", "items-center");
    expect(label.parentElement).not.toHaveClass("truncate");
  });

  test("keeps the placeholder in its own block so it still ellipsizes", () => {
    const placeholder = "Assign a guide to this job before settlement";

    render(
      React.createElement(AutoComplete, {
        placeholder,
        options: [{ label: "Alexandra Whitfield", value: "GD-1041" }],
      }),
    );

    const selectionItem = screen
      .getByRole("combobox")
      .querySelector('[data-slot="select-selection-item"]');
    const placeholderNode = screen.getByText(placeholder);

    // A bare text child of the flex row would become an anonymous flex item and
    // clip without an ellipsis.
    expect(placeholderNode).toHaveClass("truncate");
    expect(placeholderNode.parentElement).toBe(selectionItem);
  });

  test("keeps a value with no matching option in its own block so it still ellipsizes", () => {
    render(
      React.createElement(AutoComplete, {
        value: "GD-9999",
        options: [{ label: "Alexandra Whitfield", value: "GD-1041" }],
      }),
    );

    const orphanValue = screen.getByText("GD-9999");

    expect(orphanValue).toHaveClass("truncate");
    expect(orphanValue.parentElement).toHaveAttribute(
      "data-slot",
      "select-selection-item",
    );
  });

  test("gives each dropdown option icon the same unsqueezable slot as the trigger", () => {
    render(
      React.createElement(AutoComplete, {
        open: true,
        options: [{ label: "Alexandra Whitfield", value: "GD-1041" }],
        optionRender: {
          icon: () =>
            React.createElement("span", { "data-testid": "row-avatar" }, "N"),
        },
      }),
    );

    expect(screen.getByTestId("row-avatar").parentElement).toHaveClass(
      "inline-flex",
      "shrink-0",
      "items-center",
    );
  });

  test("input mode opens the panel when the field receives focus", () => {
    render(
      React.createElement(AutoComplete, {
        mode: "input",
        placeholder: "Choose a role",
        options: [
          { label: "Administrator", value: 1 },
          { label: "Editor", value: 2 },
        ],
      }),
    );

    const input = screen.getByPlaceholderText("Choose a role");
    expect(screen.queryByText("Administrator")).not.toBeInTheDocument();

    fireEvent.focus(input);

    expect(screen.getByText("Administrator")).toBeInTheDocument();
    expect(screen.getByText("Editor")).toBeInTheDocument();
  });
});
