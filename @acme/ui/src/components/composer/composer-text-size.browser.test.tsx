import * as React from "react";
import { render, waitFor } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";

import { Composer } from "./composer";

// The desktop half of composer-text-size.touch.test.tsx: with a fine pointer
// only, the composer keeps the editor's 14px — the 16px is for touch.

Object.assign(globalThis, { React });

afterEach(() => document.body.replaceChildren());

test("the context has no coarse pointer", () => {
  expect(matchMedia("(any-pointer: coarse)").matches).toBe(false);
});

test("a composer types at 14px with a fine pointer", async () => {
  render(<Composer onSubmit={() => {}} />);
  const editable = await waitFor(() => {
    const node = document.querySelector<HTMLElement>(
      '[contenteditable="true"]',
    );
    expect(node).not.toBeNull();
    return node!;
  });
  expect(getComputedStyle(editable).fontSize).toBe("14px");
});
