/* eslint-disable unicorn/no-null -- Lexical APIs and serialized editor fixtures intentionally use null semantics. */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { TextMatchTransformer } from "@lexical/markdown";
import { $createTextNode } from "lexical";

import emojiList from "../utils/emoji-list";

export const EMOJI: TextMatchTransformer = {
  dependencies: [],
  export: () => null,
  importRegExp: /:([a-z0-9_]+):/,
  regExp: /:([a-z0-9_]+):/,
  replace: (textNode, [, name]) => {
    const emoji = emojiList.find((e) => e.aliases.includes(name!))?.emoji;
    if (emoji) {
      textNode.replace($createTextNode(emoji));
    }
  },
  trigger: ":",
  type: "text-match",
};
