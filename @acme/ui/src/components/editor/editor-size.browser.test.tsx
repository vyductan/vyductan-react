import * as React from "react";
import { render, waitFor } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";

import type { SizeType } from "../config-provider/size-context";
import { Editor } from "./editor";

// Computed font size: a real browser's.

Object.assign(globalThis, { React });

afterEach(() => document.body.replaceChildren());

async function fontSizeOf(size?: SizeType) {
  render(<Editor autoFocus={false} size={size} />);
  const editable = await waitFor(() => {
    const node = document.querySelector<HTMLElement>(
      '[contenteditable="true"]',
    );
    expect(node).not.toBeNull();
    return node!;
  });
  return getComputedStyle(editable).fontSize;
}

/**
 * The editor sizes its text as Input does: 14px at small and at the default
 * middle — small only makes a control smaller, not its text — and 16px at
 * large. The default used to be 16px, the one control in the kit whose
 * middle was not 14px, so every editor in a form had to remember to ask for
 * small, and one did not.
 */
test.each([
  ["the default", undefined, "14px"],
  ["small", "small", "14px"],
  ["middle", "middle", "14px"],
  ["large", "large", "16px"],
] as const)(
  "draws %s at the size Input does",
  async (_name, size, expected) => {
    expect(await fontSizeOf(size)).toBe(expected);
  },
);
