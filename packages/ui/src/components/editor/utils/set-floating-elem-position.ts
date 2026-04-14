/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
const VERTICAL_GAP = 10;
const HORIZONTAL_OFFSET = 5;

export function setFloatingElemPosition(
  targetRect: DOMRect | null,
  floatingElement: HTMLElement,
  anchorElement: HTMLElement,
  isLink = false,
  verticalGap: number = VERTICAL_GAP,
  horizontalOffset: number = HORIZONTAL_OFFSET,
): void {
  const scrollerElement = anchorElement.parentElement;

  if (targetRect === null || !scrollerElement) {
    floatingElement.style.opacity = "0";
    floatingElement.style.transform = "translate(-10000px, -10000px)";
    return;
  }

  const floatingElementRect = floatingElement.getBoundingClientRect();
  const anchorElementRect = anchorElement.getBoundingClientRect();
  const editorScrollerRect = scrollerElement.getBoundingClientRect();

  let top = targetRect.top - floatingElementRect.height - verticalGap;
  let left = targetRect.left - horizontalOffset;

  if (top < editorScrollerRect.top) {
    // adjusted height for link element if the element is at top
    top +=
      floatingElementRect.height +
      targetRect.height +
      verticalGap * (isLink ? 9 : 2);
  }

  if (left + floatingElementRect.width > editorScrollerRect.right) {
    left = editorScrollerRect.right - floatingElementRect.width - horizontalOffset;
  }

  top -= anchorElementRect.top;
  left -= anchorElementRect.left;

  floatingElement.style.opacity = "1";
  floatingElement.style.transform = `translate(${left}px, ${top}px)`;
}
