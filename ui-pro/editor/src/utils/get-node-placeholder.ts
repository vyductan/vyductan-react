import type { LexicalNode } from "lexical";
import { $isHeadingNode } from "@lexical/rich-text";
import { $isParagraphNode } from "lexical";

export const getNodePlaceholder = (lexicalNode: LexicalNode) => {
  let placeholder = "";
  if ($isHeadingNode(lexicalNode)) {
    const tag = lexicalNode.getTag();
    placeholder = "Heading";
    switch (tag) {
      case "h1": {
        placeholder += " 1";
        break;
      }
      case "h2": {
        placeholder += " 2";
        break;
      }
      case "h3": {
        placeholder += " 3";
        break;
      }
      case "h4": {
        placeholder += " 4";
        break;
      }
      case "h5": {
        placeholder += "5";
        break;
      }
      case "h6": {
        placeholder += "6";
        break;
      }
    }
  }
  if ($isParagraphNode(lexicalNode)) {
    // Like in https://www.notion.so/
    // placeholder += "Press '/' for commands...";
    placeholder = "Write something or press '/' for commands...";
  }
  return placeholder;
};
