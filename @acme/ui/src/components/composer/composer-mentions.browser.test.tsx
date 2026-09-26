import * as React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";

import { Composer } from "./composer";

// Runs in the `browser` project: `userEvent` is Playwright-backed, so Enter
// reaches Lexical's command stack the way a real key does. That ordering is
// the point — the composer claims Enter to send, and the @ menu has to claim
// it first while it is open.

Object.assign(globalThis, { React });

afterEach(() => document.body.replaceChildren());

const people = [{ name: "Thuận" }, { name: "Hiệp" }, { name: "Mạnh" }];

async function renderComposer(createLabel?: (name: string) => string) {
  const onSubmit = vi.fn();
  render(
    <Composer
      autoFocus
      onSubmit={onSubmit}
      mentions={{ people, createLabel }}
    />,
  );
  const editable = await waitFor(() => {
    const node = document.querySelector<HTMLElement>(
      '[contenteditable="true"]',
    );
    expect(node).not.toBeNull();
    return node!;
  });
  await userEvent.click(editable);
  return { onSubmit, editable };
}

test("Enter picks the highlighted person instead of sending", async () => {
  const { onSubmit, editable } = await renderComposer();

  // Folded match: no diacritics typed, "Thuận" offered.
  await userEvent.keyboard("cho @thu");
  await screen.findByRole("option", { name: /Thuận/ });
  await userEvent.keyboard("{Enter}");

  expect(onSubmit).not.toHaveBeenCalled();
  await waitFor(() => expect(editable.textContent).toContain("cho @Thuận"));

  // Menu closed: the next Enter sends, with the mention as text.
  await userEvent.keyboard(" mượn 1m{Enter}");
  await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
  expect(onSubmit.mock.calls[0]?.[0]).toContain("@Thuận");
  expect(onSubmit.mock.calls[0]?.[0]).toContain("mượn 1m");
});

test("offers to create a single unknown name, labelled by the host", async () => {
  const { onSubmit, editable } = await renderComposer(
    (name) => `Tạo người mới: ${name}`,
  );

  await userEvent.keyboard("@Tuấn");
  const create = await screen.findByRole("option", {
    name: "Tạo người mới: Tuấn",
  });
  expect(create).toBeTruthy();
  await userEvent.keyboard("{Enter}");

  expect(onSubmit).not.toHaveBeenCalled();
  await waitFor(() => expect(editable.textContent).toContain("@Tuấn"));
});

test("no create option without createLabel, and none for a known name", async () => {
  await renderComposer((name) => `Tạo người mới: ${name}`);

  await userEvent.keyboard("@hiep");
  await screen.findByRole("option", { name: /Hiệp/ });
  expect(screen.queryByRole("option", { name: /Tạo người mới/ })).toBeNull();
});
