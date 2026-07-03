import type { Rule } from "eslint";

/**
 * Flags icon-only `<Button ... />` usages that would render with no
 * accessible name — the static-analysis twin of the dev-time console
 * warning inside `@acme/ui` Button. An accessible name can come from
 * children, `aria-label`, `aria-labelledby`, `title`, Button's `srOnly`
 * prop, or sr-only text inside the `icon` node (`<Icon srOnly="..." />`).
 *
 * Elements with a spread attribute are skipped: the spread may carry a
 * label the rule can't see (the runtime warning still covers those).
 */

// The JSX AST isn't part of eslint's bundled estree types; type the shapes
// this rule actually touches.
interface JsxIdentifier {
  type: "JSXIdentifier";
  name: string;
}

interface JsxAttribute {
  type: "JSXAttribute";
  name: JsxIdentifier | { type: "JSXNamespacedName" };
  value: JsxNode | null;
}

interface JsxSpreadAttribute {
  type: "JSXSpreadAttribute";
}

interface JsxOpeningElement {
  type: "JSXOpeningElement";
  name: JsxNode;
  attributes: (JsxAttribute | JsxSpreadAttribute)[];
  selfClosing: boolean;
}

interface JsxNode {
  type: string;
  name?: JsxNode | string;
  value?: unknown;
  expression?: JsxNode;
  openingElement?: JsxOpeningElement;
  children?: JsxNode[];
  parent?: JsxNode;
}

const NAME_ATTRIBUTES = new Set([
  "aria-label",
  "aria-labelledby",
  "title",
  "srOnly",
]);

const attributeName = (attribute: JsxAttribute | JsxSpreadAttribute) =>
  attribute.type === "JSXAttribute" && attribute.name.type === "JSXIdentifier"
    ? attribute.name.name
    : undefined;

/** Non-whitespace JSXText or any element carrying an `srOnly` attribute. */
const containsTextOrSrOnly = (node: JsxNode | null | undefined): boolean => {
  if (!node) return false;
  if (node.type === "JSXText") {
    return typeof node.value === "string" && node.value.trim() !== "";
  }
  if (node.type === "JSXExpressionContainer") {
    return containsTextOrSrOnly(node.expression);
  }
  if (node.type === "Literal") {
    return typeof node.value === "string" && node.value.trim() !== "";
  }
  if (node.type === "JSXElement" && node.openingElement) {
    if (
      node.openingElement.attributes.some(
        (attribute) => attributeName(attribute) === "srOnly",
      )
    ) {
      return true;
    }
  }
  return (node.children ?? []).some((child) => containsTextOrSrOnly(child));
};

export const buttonAccessibleNameRule: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Icon-only <Button> must have an accessible name (aria-label, aria-labelledby, title, srOnly, or sr-only text inside the icon).",
    },
    messages: {
      missingName:
        "Icon-only <Button> has no accessible name. Add aria-label / title / srOnly, or srOnly on the inner <Icon>.",
    },
    schema: [],
  },
  create(context) {
    return {
      JSXOpeningElement(estreeNode: Rule.Node) {
        const node = estreeNode as unknown as JsxOpeningElement & {
          parent?: JsxNode;
        };

        const elementName = node.name as JsxNode;
        if (
          elementName.type !== "JSXIdentifier" ||
          elementName.name !== "Button"
        ) {
          return;
        }

        // A spread may carry aria-label etc. — leave those to the runtime check.
        if (
          node.attributes.some(
            (attribute) => attribute.type === "JSXSpreadAttribute",
          )
        ) {
          return;
        }

        const names = new Set(
          node.attributes
            .map((attribute) => attributeName(attribute))
            .filter((name): name is string => name !== undefined),
        );

        // Only icon-only / loading-only buttons are in scope.
        if (!names.has("icon") && !names.has("loading")) return;

        if ([...NAME_ATTRIBUTES].some((name) => names.has(name))) return;

        // Children (non-whitespace) give the button visible text.
        if (!node.selfClosing) {
          const children = (node.parent?.children ?? []) as JsxNode[];
          if (children.some((child) => containsTextOrSrOnly(child))) return;
          if (
            children.some(
              (child) =>
                child.type !== "JSXText" ||
                (typeof child.value === "string" && child.value.trim() !== ""),
            )
          ) {
            // Non-text children (elements/expressions) — assume they render
            // something nameable rather than false-positive.
            return;
          }
        }

        // sr-only text (or literal text) inside the icon counts as a name.
        const iconAttribute = node.attributes.find(
          (attribute) => attributeName(attribute) === "icon",
        ) as JsxAttribute | undefined;
        if (iconAttribute && containsTextOrSrOnly(iconAttribute.value)) return;

        context.report({ node: estreeNode, messageId: "missingName" });
      },
    };
  },
};
