import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
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
    <AsyncActionButton action={action} idleIcon={<span data-testid="idle-icon" />}>
      Download
    </AsyncActionButton>,
  );

  const button = screen.getByRole("button", { name: "Download" });

  fireEvent.click(button);

  await waitFor(() => {
    expect(action).toHaveBeenCalledTimes(1);
    expect(button).toHaveProperty("disabled", true);
    expect(button.getAttribute("aria-busy")).toBe("true");
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
    expect(screen.getAllByText("Could not download this file").length).toBeGreaterThan(0);
  });

  expect(screen.getByRole("button", { name: "Download" }).getAttribute("aria-invalid")).toBe(
    "true",
  );
});
