import "@testing-library/jest-dom/vitest";

import * as React from "react";
import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";

import { Editor } from "./editor";

Object.assign(globalThis, { React });

afterEach(() => {
  cleanup();
});

/**
 * Pins that each key of `classNames` reaches its own part. The
 * placeholder-alignment stories do NOT cover this: they check that the prompt
 * and the caret agree, which stays true even when neither class is applied at
 * all — both ablations passed those stories.
 */
test("classNames.content lands on the editable area", async () => {
  const { container } = render(
    <Editor classNames={{ content: "content-probe" }} editable />,
  );

  const editable = await waitFor(() => {
    const node = container.querySelector('[contenteditable="true"]');
    expect(node).not.toBeNull();
    return node as HTMLElement;
  });

  expect(editable).toHaveClass("content-probe");
});

test("classNames.placeholder lands on the placeholder", async () => {
  const { container } = render(
    <Editor
      classNames={{ placeholder: "placeholder-probe" }}
      editable
      placeholder="Write something"
    />,
  );

  const placeholder = await waitFor(() => {
    // Matched on the slot, not the text: the placeholder shown depends on the
    // current block type, so the string is not a stable handle.
    const node = container.querySelector('[data-slot="editor-placeholder"]');
    expect(node).not.toBeNull();
    return node as HTMLElement;
  });

  expect(placeholder).toHaveClass("placeholder-probe");
});

test("className still belongs to the scroll container, not a part", async () => {
  const { container } = render(
    <Editor
      className="root-probe"
      classNames={{ content: "content-probe" }}
      editable
    />,
  );

  const scroller = await waitFor(() => {
    const node = container.querySelector(".root-probe");
    expect(node).not.toBeNull();
    return node as HTMLElement;
  });

  expect(scroller).toHaveClass("editor-scroll-container");
  expect(scroller).not.toHaveClass("content-probe");
});
