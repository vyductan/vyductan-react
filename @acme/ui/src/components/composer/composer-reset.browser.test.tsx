import * as React from "react";
import { render, waitFor } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";

import { Composer } from "./composer";

// Runs in the `browser` project: the format shortcut has to be a real key
// press. Storybook's synthetic userEvent never reaches Lexical's
// FORMAT_TEXT_COMMAND, so a story would pass with the bug live.

Object.assign(globalThis, { React });

afterEach(() => document.body.replaceChildren());

// Lexical binds bold to Cmd on Apple platforms and Ctrl elsewhere.
const modifier = /Mac|iPhone|iPad/.test(navigator.platform)
  ? "Meta"
  : "Control";

async function renderComposer() {
  const onSubmit = vi.fn();
  render(<Composer autoFocus onSubmit={onSubmit} />);
  const editable = await waitFor(() => {
    const node = document.querySelector<HTMLElement>(
      '[contenteditable="true"]',
    );
    expect(node).not.toBeNull();
    return node!;
  });
  await userEvent.click(editable);
  await waitFor(() => expect(editable).toHaveFocus());
  return { onSubmit, editable };
}

const sendPaths = {
  Enter: () => userEvent.keyboard("{Enter}"),
  // The path a phone takes. Focus leaves the editor for the button, so the
  // selectionchange that resets the format on Enter never arrives.
  "the send button": () =>
    userEvent.click(
      document.querySelector<HTMLElement>('[aria-label="Send message"]')!,
    ),
};

for (const [name, send] of Object.entries(sendPaths)) {
  test(`formatting switched on in one message does not carry into the next (${name})`, async () => {
    const { onSubmit, editable } = await renderComposer();

    await userEvent.keyboard(`{${modifier}>}b{/${modifier}}`);
    await userEvent.keyboard(`{${modifier}>}i{/${modifier}}`);
    await userEvent.keyboard("loud");
    await waitFor(() =>
      expect(editable.querySelector("strong")).not.toBeNull(),
    );
    await send();
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0]?.[0]).toContain("loud");

    await userEvent.keyboard("plain");
    await waitFor(() => expect(editable).toHaveTextContent("plain"));

    expect(editable.querySelector("strong")).toBeNull();
    expect(editable.querySelector("em")).toBeNull();
    expect(editable.children).toHaveLength(1);
    expect(editable.firstElementChild?.tagName).toBe("P");

    await send();
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(2));
    expect(onSubmit.mock.calls[1]?.[0]).toBe("plain");
  });
}

test("a list sent from does not leave the next message in a list", async () => {
  const { onSubmit, editable } = await renderComposer();

  await userEvent.keyboard("- item");
  await waitFor(() => expect(editable.querySelector("li")).not.toBeNull());
  await userEvent.keyboard("{Enter}");
  await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));

  await userEvent.keyboard("next");
  await waitFor(() => expect(editable).toHaveTextContent("next"));

  expect(editable.querySelector("li")).toBeNull();
  expect(editable.firstElementChild?.tagName).toBe("P");
  await userEvent.keyboard("{Enter}");
  await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(2));
  expect(onSubmit.mock.calls[1]?.[0]).toBe("next");
});
