import * as React from "react";
import { render, waitFor } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";

import { Composer } from "./composer";

// Runs in the `touch` project: a Chromium context created with `hasTouch`.
// iOS Safari (and the dashboard app's webview) zooms the page in when a
// focused field's text is under 16px, and the composer drew the editor's
// 14px. The desktop half lives in composer-text-size.browser.test.tsx, so
// together they prove the bump is gated on touch, not a blanket 16px.

Object.assign(globalThis, { React });

afterEach(() => document.body.replaceChildren());

async function editableOf(element: React.ReactElement) {
  render(element);
  return waitFor(() => {
    const node = document.querySelector<HTMLElement>(
      '[contenteditable="true"]',
    );
    expect(node).not.toBeNull();
    return node!;
  });
}

test("the context really is a touch device", () => {
  expect(matchMedia("(any-pointer: coarse)").matches).toBe(true);
});

test.each(["small", "middle"] as const)(
  "a %s composer types at 16px on touch, so iOS does not zoom on focus",
  async (size) => {
    const editable = await editableOf(
      <Composer size={size} onSubmit={() => {}} />,
    );
    expect(getComputedStyle(editable).fontSize).toBe("16px");
  },
);

test("the placeholder follows, so it still sits where the text will", async () => {
  await editableOf(<Composer placeholder="Ask…" onSubmit={() => {}} />);
  const placeholder = document.querySelector<HTMLElement>(
    '[data-slot="editor-placeholder"]',
  );
  expect(placeholder).not.toBeNull();
  expect(getComputedStyle(placeholder!).fontSize).toBe("16px");
});
