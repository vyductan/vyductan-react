import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, expect, test } from "vitest";

import DownloadButtonDemo from "./download-button";

const originalResizeObserver = globalThis.ResizeObserver;

beforeAll(() => {
  globalThis.ResizeObserver ??= class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

afterEach(cleanup);

afterAll(() => {
  globalThis.ResizeObserver = originalResizeObserver;
});

test("lets users switch the download example into failure mode and preview the inline tooltip", async () => {
  render(<DownloadButtonDemo />);

  fireEvent.click(screen.getByRole("button", { name: "Fail" }));
  fireEvent.click(screen.getByRole("button", { name: "Download" }));

  await waitFor(() => {
    expect(screen.getAllByText("Could not download this report. Try again.").length).toBeGreaterThan(0);
  });

  expect(screen.getByRole("button", { name: "Download" }).getAttribute("aria-invalid")).toBe(
    "true",
  );
});
