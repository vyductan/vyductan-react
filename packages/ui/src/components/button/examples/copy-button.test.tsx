import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import { CopyButton } from "./copy-button";

beforeEach(() => {
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: {
      writeText: vi.fn().mockImplementation(() => Promise.resolve()),
    }
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

test("uses custom aria labels, reset delay, and copied callback", async () => {
  const onCopied = vi.fn();

  render(
    <CopyButton
      value="pnpm dev"
      ariaLabel="Copy install command"
      copiedLabel="Install command copied"
      resetDelay={1}
      onCopied={onCopied}
      className="copy-button-test"
    />,
  );

  const button = screen.getByRole("button", { name: "Copy install command" });

  expect(button.className).toContain("copy-button-test");
  expect(button.dataset.variant).toBe("text");

  fireEvent.click(button);

  await waitFor(() => {
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("pnpm dev");
    expect(onCopied).toHaveBeenCalledTimes(1);
  });
  expect(
    screen.getByRole("button", { name: "Install command copied" }),
  ).toBeTruthy();

  await waitFor(() => {
    expect(
      screen.getByRole("button", { name: "Copy install command" }),
    ).toBeTruthy();
  });
});
