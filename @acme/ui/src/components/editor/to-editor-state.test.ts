import { describe, expect, it } from "vitest";

import {
  isSerializedEditorState,
  plainTextToEditorState,
  toEditorState,
} from "./to-editor-state";

/**
 * The editor reads its state ONCE, as `initialConfig.editorState`, so a value it
 * rejects is a blank editor for the lifetime of the mount — and in a form that
 * autosaves, the next keystroke writes that blank over the text nobody saw.
 * These cases are the ones that decide whether prose survives that trip.
 */
describe("toEditorState", () => {
  it("turns prose into a document instead of dropping it", () => {
    const parsed = JSON.parse(toEditorState("Split out of the old branch")) as {
      root: { children: { children: { text: string }[] }[] };
    };
    expect(parsed.root.children[0]!.children[0]!.text).toBe(
      "Split out of the old branch",
    );
  });

  it("passes an existing editor state through by identity", () => {
    // Re-wrapping would nest the document in a paragraph and lose its
    // formatting — the failure that looks like "my bold went away".
    const state = plainTextToEditorState("already a document");
    expect(toEditorState(state)).toBe(state);
  });

  it("keeps blank lines as empty paragraphs", () => {
    const parsed = JSON.parse(plainTextToEditorState("one\n\ntwo")) as {
      root: { children: { children: unknown[] }[] };
    };
    expect(parsed.root.children).toHaveLength(3);
    expect(parsed.root.children[1]!.children).toHaveLength(0);
  });

  it("normalises CRLF so a Windows-authored body is not double-spaced", () => {
    const parsed = JSON.parse(plainTextToEditorState("one\r\ntwo")) as {
      root: { children: unknown[] };
    };
    expect(parsed.root.children).toHaveLength(2);
  });

  it("treats JSON without a root as prose", () => {
    // A body opening with a code snippet parses fine; handed to Lexical as a
    // document it renders nothing at all.
    expect(isSerializedEditorState('{"foo":1}')).toBe(false);
    const parsed = JSON.parse(toEditorState('{"foo":1}')) as {
      root: { children: { children: { text: string }[] }[] };
    };
    expect(parsed.root.children[0]!.children[0]!.text).toBe('{"foo":1}');
  });
});
