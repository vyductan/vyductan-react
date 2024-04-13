import type { LexicalEditor, LexicalNode, RangeSelection } from "lexical";

import { clsm } from "@acme/ui";

import { getAllLexicalChildren } from "./getAllLexicalChildren";
import { getNodePlaceholder } from "./getNodePlaceholder";

const PLACEHOLDER_CLASS_NAME = clsm(
  "[&:has(br):not(:has(span))::before]:absolute [&:has(br):not(:has(span))::before]:text-placeholder [&:has(br):not(:has(span))::before]:content-[attr(data-placeholder)]",
).split(" ");

const isHtmlHeadingElement = (el: HTMLElement): el is HTMLHeadingElement => {
  return el instanceof HTMLHeadingElement;
};

export const setPlaceholderOnSelection = ({
  selection,
  editor,
}: {
  selection: RangeSelection;
  editor: LexicalEditor;
}): void => {
  /**
   * 1. Get all lexical nodes as HTML elements
   */
  const children = getAllLexicalChildren(editor);

  /**
   * 2. Remove "placeholder" class if it was added before
   */
  children.forEach(({ htmlElement }) => {
    if (!htmlElement) {
      return;
    }

    if (isHtmlHeadingElement(htmlElement)) {
      return;
    }

    const classList = htmlElement.classList;

    if (
      classList.length &&
      classList.value.includes(PLACEHOLDER_CLASS_NAME.join(" "))
    ) {
      classList.remove(...PLACEHOLDER_CLASS_NAME);
    }
  });

  /**
   * 3. Do nothing if there is only one lexical child,
   * because we already have a placeholder
   * in <RichTextPlugin/> component
   * With on exception: If we converted default node to the "Heading"
   */
  if (
    children.length === 1 &&
    children[0]?.htmlElement &&
    !isHtmlHeadingElement(children[0].htmlElement)
  ) {
    return;
  }

  /**
   * 4. Get "PointType" object, that contain Nodes data
   * (that is selected)
   * {
   *    key: "5", <- Node's key
   *    offset: 7,
   *    type: "text"
   * }
   */
  const anchor = selection.anchor;

  /**
   * 5. Get placeholder for type ('heading'/'paragraph'/etc...)
   */
  const placeholder = getNodePlaceholder(anchor.getNode() as LexicalNode);

  if (placeholder) {
    const selectedHtmlElement = editor.getElementByKey(anchor.key);

    selectedHtmlElement?.classList.add(...PLACEHOLDER_CLASS_NAME);
    selectedHtmlElement?.setAttribute("data-placeholder", placeholder);
  }
};
