import React from "react";

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

import { TimePicker } from "./time-picker";

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

afterEach(() => {
  cleanup();
});

describe("TimePicker", () => {
  test("formats parseable string values with the configured display format", () => {
    render(<TimePicker format="HH:mm" value="12:08:30" />);

    expect(screen.getByRole("textbox")).toHaveValue("12:08");
  });
});
