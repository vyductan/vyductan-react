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
  const doc = document as DocumentWithCaretApi;

  if (typeof doc.caretRangeFromPoint === "function") {
    const range = doc.caretRangeFromPoint(x, y);
    if (!range) {
      return null;
    }
    return {
      node: range.startContainer,
      offset: range.startOffset,
    };
  }

  if (typeof doc.caretPositionFromPoint === "function") {
    const caret = doc.caretPositionFromPoint(x, y);
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
