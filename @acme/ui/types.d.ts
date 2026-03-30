/**
 * Since the ecosystem hasn't fully migrated to ESLint's new FlatConfig system yet,
 * we "need" to type some of the plugins manually :(
 */

// declare module "eslint-plugin-import" {
//   import type { Linter, Rule } from "eslint";

//   export const configs: {
//     recommended: { rules: Linter.RulesRecord };
//   };
//   export const rules: Record<string, Rule.RuleModule>;
// }

// declare module "eslint-plugin-react" {
//   import type { Linter, Rule } from "eslint";

//   export const configs: {
//     flat: {
//       recommended: { rules: Linter.RulesRecord };
//       "jsx-runtime": { rules: Linter.RulesRecord };
//     };
//   };
//   export const rules: Record<string, Rule.RuleModule>;
// }

declare module "@next/eslint-plugin-next" {
  import type { Linter, Rule } from "eslint";

  export const configs: {
    recommended: { rules: Linter.RulesRecord };
    "core-web-vitals": { rules: Linter.RulesRecord };
  };
  export const rules: Record<string, Rule.RuleModule>;
}

// declare module "eslint-plugin-drizzle" {
//   import type { Linter, Rule } from "eslint";

//   export const configs: {
//     recommended: { rules: Linter.RulesRecord };
//   };
//   export const rules: Record<string, Rule.RuleModule>;
// }

declare module "eslint-plugin-storybook" {
  import type { ConfigArray, ConfigWithExtends } from "eslint/config";

  export const configs: {
    "flat/recommended": ConfigArray<ConfigWithExtends>;
  };
}

declare module "*.css";
declare module "swiper/css";
declare module "swiper/css/*";

declare module "@lexical/react/LexicalContextMenuPlugin" {
  import type { LexicalNode } from "lexical";
  import type { ReactNode, RefObject } from "react";

  export class MenuOption {
    key: string;
    ref?: RefObject<HTMLElement | null>;
    constructor(key: string);
    setRefElement(element: HTMLElement | null): void;
  }

  export type LexicalContextMenuPluginProps<TOption extends MenuOption> = {
    options: TOption[];
    onSelectOption: (option: TOption, targetNode: LexicalNode | null) => void;
    onWillOpen?: (event: MouseEvent) => void;
    onOpen?: () => void;
    onClose?: () => void;
    menuRenderFn?: (
      anchorElementRef: RefObject<HTMLElement | null>,
      menuContext: {
        options: TOption[];
        selectOptionAndCleanUp: (option: TOption) => void;
      },
      helpers: {
        setMenuRef: (element: HTMLElement | null) => void;
      },
    ) => ReactNode;
  };

  export function LexicalContextMenuPlugin<TOption extends MenuOption>(
    props: LexicalContextMenuPluginProps<TOption>,
  ): ReactNode;
}

declare module "jsdom" {
  export class JSDOM {
    window: { document: Document };
    constructor(html?: string);
  }
}
