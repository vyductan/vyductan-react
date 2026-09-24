import type { Rule } from "eslint";

/**
 * Flags icon-only `<Button ... />` usages that would render with no
 * accessible name — the static-analysis twin of the dev-time console
 * warning inside `@acme/ui` Button. An accessible name can come from
 * children, `aria-label`, `aria-labelledby`, `title`, Button's `srOnly`
 * prop, or sr-only text inside the `icon` node (`<Icon srOnly="..." />`).
 *
 * A button is icon-only when it has an `icon`/`loading` prop, or when every
 * child is an icon element: `<svg>`, `<Icon>`, a `*Icon` component, or one
 * imported from an icon module (`<Button><Minus /></Button>`). Any other
 * child — text, an expression, a non-icon component — may render a name, so
 * it is left alone rather than risk a false positive.
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

/** Modules whose exports are icon components. */
const ICON_MODULE =
  /^(?:lucide-react|@acme\/ui\/icons|@radix-ui\/react-icons|react-icons(?:\/.*)?|@tabler\/icons-react|@heroicons\/react(?:\/.*)?)$/;

interface ImportDeclarationNode {
  source: { value: unknown };
  specifiers: { type: string; local: { name: string } }[];
}

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
    // Local names bound to icon components (`import { Minus } from
    // "lucide-react"`) and to icon namespaces (`import * as Icons from ...`).
    const iconImports = new Set<string>();
    const iconNamespaces = new Set<string>();

    const isIconElement = (child: JsxNode): boolean => {
      if (child.type !== "JSXElement" || !child.openingElement) return false;
      const name = child.openingElement.name;
      if (name.type === "JSXIdentifier" && typeof name.name === "string") {
        return (
          name.name === "svg" ||
          name.name === "Icon" ||
          name.name.endsWith("Icon") ||
          iconImports.has(name.name)
        );
      }
      if (name.type === "JSXMemberExpression") {
        const object = (name as unknown as { object: JsxNode }).object;
        return (
          object.type === "JSXIdentifier" &&
          typeof object.name === "string" &&
          (iconNamespaces.has(object.name) || /Icons?$/.test(object.name))
        );
      }
      return false;
    };

    return {
      ImportDeclaration(estreeNode: Rule.Node) {
        const node = estreeNode as unknown as ImportDeclarationNode;
        if (
          typeof node.source.value !== "string" ||
          !ICON_MODULE.test(node.source.value)
        ) {
          return;
        }
        for (const specifier of node.specifiers) {
          (specifier.type === "ImportNamespaceSpecifier"
            ? iconNamespaces
            : iconImports
          ).add(specifier.local.name);
        }
      },
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

        if ([...NAME_ATTRIBUTES].some((name) => names.has(name))) return;

        const children = node.selfClosing
          ? []
          : ((node.parent?.children ?? []) as JsxNode[]).filter(
              (child) =>
                child.type !== "JSXText" ||
                (typeof child.value === "string" && child.value.trim() !== ""),
            );

        // Visible text, or sr-only text, anywhere in the children names it.
        if (children.some((child) => containsTextOrSrOnly(child))) return;

        const iconOnlyChildren =
          children.length > 0 &&
          children.every((child) => isIconElement(child));
        // Other children (expressions, non-icon components) may render a
        // name — assume they do rather than false-positive.
        if (children.length > 0 && !iconOnlyChildren) return;

        // Only icon-only / loading-only buttons are in scope.
        if (!iconOnlyChildren && !names.has("icon") && !names.has("loading")) {
          return;
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
