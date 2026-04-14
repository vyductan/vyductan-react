/* eslint-disable unicorn/no-null -- Lexical APIs and serialized editor fixtures intentionally use null semantics. */
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
type DocumentWithCaretApi = Document & {
  caretRangeFromPoint?: (x: number, y: number) => Range | null;
  caretPositionFromPoint?: (
    x: number,
    y: number,
  ) => {
    offsetNode: Node;
    offset: number;
  } | null;
};

export function caretFromPoint(
  x: number,
  y: number,
): null | {
  offset: number;
  node: Node;
} {
  const document_ = document as DocumentWithCaretApi;

  if (typeof document_.caretRangeFromPoint === "function") {
    const range = document_.caretRangeFromPoint(x, y);
    if (!range) {
      return null;
    }
    return {
      node: range.startContainer,
      offset: range.startOffset,
    };
  }

  if (typeof document_.caretPositionFromPoint === "function") {
    const caret = document_.caretPositionFromPoint(x, y);
    if (!caret) {
      return null;
    }
    return {
      node: caret.offsetNode,
      offset: caret.offset,
    };
  }

  // Gracefully handle browsers without the API
  return null;
}
