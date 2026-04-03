import React from "react";

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { Slider } from ".";

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

describe("Slider", () => {
  test("does not forward ariaLabel to the root element while keeping aria-label on the thumb", () => {
    const handleValueChange = vi.fn();
    const { container } = render(
      <Slider
        ariaLabel="Lightness"
        value={[40]}
        onValueChange={handleValueChange}
      />,
    );

    const root = container.querySelector("[data-orientation]");

    expect(root).not.toHaveAttribute("ariaLabel");
    expect(root).not.toHaveAttribute("arialabel");
    expect(screen.getByLabelText("Lightness")).toHaveAttribute(
      "aria-label",
      "Lightness",
    );
  });

  test("renders one thumb per value for shadcn slider usage", () => {
    const handleValueChange = vi.fn();
    const { container } = render(
      <Slider value={[20, 80]} onValueChange={handleValueChange} />,
    );

    expect(container.querySelectorAll("[data-orientation] [role='slider']")).toHaveLength(2);
  });

  test("renders one thumb per defaultValue item for uncontrolled shadcn slider usage", () => {
    const { container } = render(<Slider defaultValue={[20, 80]} />);

    expect(container.querySelectorAll("[data-orientation] [role='slider']")).toHaveLength(2);
  });
});
