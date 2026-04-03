import React from "react";

import "@testing-library/jest-dom/vitest";

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import type { ToasterProps as SonnerToasterProps } from "sonner";

const sonnerPointerDown = vi.fn();

type MockSonnerProps = {
  className?: string;
  toastOptions?: SonnerToasterProps["toastOptions"];
};

vi.mock("@acme/ui/shadcn/sonner", async () => {
  const React = await import("react");

  const MockSonner = React.forwardRef<HTMLDivElement, MockSonnerProps>(
    ({ className, toastOptions }, ref) => {
      const classNames = toastOptions?.classNames;

      return (
        <div
          ref={ref}
          data-testid="mock-sonner"
          className={className}
          data-title-class={classNames?.title}
          data-description-class={classNames?.description}
          data-success-class={classNames?.success}
          data-error-class={classNames?.error}
          data-close-button-class={classNames?.closeButton}
        >
          <div
            data-sonner-toast=""
            data-testid="toast-root"
            onPointerDown={sonnerPointerDown}
          >
            <div data-title="" data-testid="toast-title">
              Selectable title
              <span data-testid="toast-title-child">Nested plain message text</span>
              <div data-testid="toast-custom-text">Custom JSX text</div>
            </div>
            <div data-description="" data-testid="toast-description">
              Selectable description
            </div>
            <div data-testid="toast-surface-gap">Surface gap</div>
            <button data-button data-action data-testid="toast-action">
              Action
            </button>
            <button data-close-button data-testid="toast-close">Close</button>
          </div>
        </div>
      );
    },
  );

  return { Toaster: MockSonner };
});

import { Toaster } from "./toaster";

globalThis.React = React;

beforeEach(() => {
  sonnerPointerDown.mockClear();
});

afterEach(() => {
  cleanup();
});

describe("Toaster text selection integration", () => {
  test("merges local selection and styling classNames into toastOptions", () => {
    render(
      <Toaster
        toastOptions={{
          classNames: {
            success: "custom-success",
            title: "custom-title",
          },
        }}
      />,
    );

    const mockSonner = screen.getByTestId("mock-sonner");

    expect(mockSonner).toHaveAttribute(
      "data-title-class",
      expect.stringContaining("select-text"),
    );
    expect(mockSonner).toHaveAttribute(
      "data-title-class",
      expect.stringContaining("custom-title"),
    );
    expect(mockSonner).toHaveAttribute(
      "data-description-class",
      expect.stringContaining("select-text"),
    );
    expect(mockSonner).toHaveAttribute(
      "data-success-class",
      expect.stringContaining("!bg-green-100"),
    );
    expect(mockSonner).toHaveAttribute(
      "data-success-class",
      expect.stringContaining("custom-success"),
    );
    expect(mockSonner).toHaveAttribute(
      "data-error-class",
      expect.stringContaining("!bg-red-100"),
    );
    expect(mockSonner).toHaveAttribute(
      "data-close-button-class",
      expect.stringContaining("-right-3.5"),
    );
  });

  test("blocks Sonner swipe setup when pointerdown starts on title text", () => {
    render(<Toaster />);

    fireEvent.pointerDown(screen.getByTestId("toast-title"), {
      button: 0,
      pointerId: 1,
    });

    expect(sonnerPointerDown).not.toHaveBeenCalled();
  });

  // Plain shared messages render through Sonner's title slot, so these toaster tests are the automated coverage for message.* text-selection behavior.
  test("blocks Sonner swipe setup for nested plain message text inside the title slot", () => {
    render(<Toaster />);

    fireEvent.pointerDown(screen.getByTestId("toast-title-child"), {
      button: 0,
      pointerId: 1,
    });

    expect(sonnerPointerDown).not.toHaveBeenCalled();
  });

  test("blocks Sonner swipe setup from the description slot", () => {
    render(<Toaster />);

    fireEvent.pointerDown(screen.getByTestId("toast-description"), {
      button: 0,
      pointerId: 1,
    });

    expect(sonnerPointerDown).not.toHaveBeenCalled();
  });

  test("blocks Sonner swipe setup for non-interactive custom JSX text inside the title slot", () => {
    render(<Toaster />);

    fireEvent.pointerDown(screen.getByTestId("toast-custom-text"), {
      button: 0,
      pointerId: 1,
    });

    expect(sonnerPointerDown).not.toHaveBeenCalled();
  });

  test("keeps Sonner swipe setup for non-text toast surface drags", () => {
    render(<Toaster />);

    fireEvent.pointerDown(screen.getByTestId("toast-surface-gap"), {
      button: 0,
      pointerId: 1,
    });

    expect(sonnerPointerDown).toHaveBeenCalledTimes(1);
  });

  test("keeps Sonner pointer handling for action buttons", () => {
    render(<Toaster />);

    fireEvent.pointerDown(screen.getByTestId("toast-action"), {
      button: 0,
      pointerId: 1,
    });

    expect(sonnerPointerDown).toHaveBeenCalledTimes(1);
  });

  test("keeps Sonner pointer handling for close buttons", () => {
    render(<Toaster />);

    fireEvent.pointerDown(screen.getByTestId("toast-close"), {
      button: 0,
      pointerId: 1,
    });

    expect(sonnerPointerDown).toHaveBeenCalledTimes(1);
  });
});
