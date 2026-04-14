/* eslint-disable unicorn/no-null -- Lexical APIs and serialized editor fixtures intentionally use null semantics. */
import type { TextMatchTransformer } from "@lexical/markdown";

import {
  $createEquationNode,
  $isEquationNode,
  EquationNode,
} from "../nodes/equation-node";

export const EQUATION: TextMatchTransformer = {
  dependencies: [EquationNode],
  export: (node) => {
    if (!$isEquationNode(node)) {
      return null;
    }

    return `$${node.getEquation()}$`;
  },
  importRegExp: /\$([^$]+?)\$/,
  regExp: /\$([^$]+?)\$$/,
  replace: (textNode, match) => {
    const [, equation] = match;
    const equationNode = $createEquationNode(equation, true);
    textNode.replace(equationNode);
  },
  trigger: "$",
  type: "text-match",
};
