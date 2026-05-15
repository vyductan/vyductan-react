import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterAll, afterEach, beforeAll, expect, test, vi } from "vitest";

import { AsyncActionButton } from "./async-action-button";

const originalResizeObserver = globalThis.ResizeObserver;

beforeAll(() => {
  globalThis.ResizeObserver ??= class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

afterAll(() => {
  globalThis.ResizeObserver = originalResizeObserver;
});

test("keeps the async action button loading while the action is pending", async () => {
  let resolveAction!: () => void;
  const action = vi.fn(
    () =>
      new Promise<void>((resolve) => {
        resolveAction = resolve;
      }),
  );

  render(
    <AsyncActionButton
      action={action}
      idleIcon={<span data-testid="idle-icon" />}
    >
      Download
    </AsyncActionButton>,
  );

  const button = screen.getByRole("button", { name: "Download" });

  fireEvent.click(button);

  await waitFor(() => {
    expect(action).toHaveBeenCalledTimes(1);
    expect(button).toHaveProperty("disabled", true);
    expect(button.getAttribute("aria-busy")).toBe("true");
    expect(button.dataset.asyncStatus).toBe("loading");
    expect(button.className).toContain("cursor-not-allowed");
    expect(button.className).toContain("opacity-95");
    expect(
      button.querySelector('[data-slot="async-action-icon"]'),
    ).not.toBeNull();
  });

  resolveAction();
});

test("shows an inline error tooltip at the button when the action fails", async () => {
  render(
    <AsyncActionButton
      action={() => Promise.reject(new Error("Download failed"))}
      errorTooltip="Could not download this file"
      idleIcon={<span data-testid="download-icon" />}
    >
      Download
    </AsyncActionButton>,
  );

  fireEvent.click(screen.getByRole("button", { name: "Download" }));

  await waitFor(() => {
    expect(
      screen.getAllByText("Could not download this file").length,
    ).toBeGreaterThan(0);
  });

  expect(
    screen
      .getByRole("button", { name: "Download" })
      .getAttribute("aria-invalid"),
  ).toBe("true");
});

test("keeps success feedback for resetDelay before returning to idle", async () => {
  vi.useFakeTimers();

  render(
    <AsyncActionButton
      action={() => Promise.resolve()}
      idleIcon={<span data-testid="idle-icon" />}
      resetDelay={1000}
      successIcon={<span data-testid="success-icon" />}
    >
      Download
    </AsyncActionButton>,
  );

  fireEvent.click(screen.getByRole("button", { name: "Download" }));

  await act(() => Promise.resolve());

  expect(screen.getByTestId("success-icon")).toBeDefined();

  act(() => vi.advanceTimersByTime(999));

  expect(screen.getByTestId("success-icon")).toBeDefined();

  act(() => vi.advanceTimersByTime(1));

  expect(screen.getByTestId("idle-icon")).toBeDefined();
});

test("keeps error feedback for errorResetDelay before returning to idle", async () => {
  vi.useFakeTimers();

  render(
    <AsyncActionButton
      action={() => Promise.reject(new Error("Download failed"))}
      errorResetDelay={4000}
      errorTooltip="Could not download this file"
      idleIcon={<span data-testid="idle-icon" />}
      resetDelay={1000}
    >
      Download
    </AsyncActionButton>,
  );

  const button = screen.getByRole("button", { name: "Download" });

  fireEvent.click(button);

  await act(() => Promise.resolve());

  expect(button.getAttribute("aria-invalid")).toBe("true");
  expect(
    screen.getAllByText("Could not download this file").length,
  ).toBeGreaterThan(0);

  act(() => vi.advanceTimersByTime(3999));

  expect(button.getAttribute("aria-invalid")).toBe("true");
  expect(
    screen.getAllByText("Could not download this file").length,
  ).toBeGreaterThan(0);

  act(() => vi.advanceTimersByTime(1));

  expect(button.getAttribute("aria-invalid")).toBeNull();
  expect(screen.getByTestId("idle-icon")).toBeDefined();
});

test("uses 4500ms as the error reset delay when errorResetDelay is true", async () => {
  vi.useFakeTimers();

  render(
    <AsyncActionButton
      action={() => Promise.reject(new Error("Download failed"))}
      errorResetDelay
      errorTooltip="Could not download this file"
      idleIcon={<span data-testid="idle-icon" />}
      resetDelay={1000}
    >
      Download
    </AsyncActionButton>,
  );

  const button = screen.getByRole("button", { name: "Download" });

  fireEvent.click(button);

  await act(() => Promise.resolve());

  expect(button.getAttribute("aria-invalid")).toBe("true");

  act(() => vi.advanceTimersByTime(4499));

  expect(button.getAttribute("aria-invalid")).toBe("true");

  act(() => vi.advanceTimersByTime(1));

  expect(button.getAttribute("aria-invalid")).toBeNull();
  expect(screen.getByTestId("idle-icon")).toBeDefined();
});

test("does not auto reset error feedback by default", async () => {
  vi.useFakeTimers();

  render(
    <AsyncActionButton
      action={() => Promise.reject(new Error("Download failed"))}
      errorTooltip="Could not download this file"
      idleIcon={<span data-testid="idle-icon" />}
      resetDelay={1000}
    >
      Download
    </AsyncActionButton>,
  );

  const button = screen.getByRole("button", { name: "Download" });

  fireEvent.click(button);

  await act(() => Promise.resolve());

  expect(button.getAttribute("aria-invalid")).toBe("true");
  expect(
    screen.getAllByText("Could not download this file").length,
  ).toBeGreaterThan(0);

  act(() => vi.advanceTimersByTime(30_000));

  expect(button.getAttribute("aria-invalid")).toBe("true");
  expect(
    screen.getAllByText("Could not download this file").length,
  ).toBeGreaterThan(0);
});

test("does not auto reset error feedback when errorResetDelay is false", async () => {
  vi.useFakeTimers();

  render(
    <AsyncActionButton
      action={() => Promise.reject(new Error("Download failed"))}
      errorResetDelay={false}
      errorTooltip="Could not download this file"
      idleIcon={<span data-testid="idle-icon" />}
      resetDelay={1000}
    >
      Download
    </AsyncActionButton>,
  );

  const button = screen.getByRole("button", { name: "Download" });

  fireEvent.click(button);

  await act(() => Promise.resolve());

  expect(button.getAttribute("aria-invalid")).toBe("true");
  expect(
    screen.getAllByText("Could not download this file").length,
  ).toBeGreaterThan(0);

  act(() => vi.advanceTimersByTime(30_000));

  expect(button.getAttribute("aria-invalid")).toBe("true");
  expect(
    screen.getAllByText("Could not download this file").length,
  ).toBeGreaterThan(0);
});
