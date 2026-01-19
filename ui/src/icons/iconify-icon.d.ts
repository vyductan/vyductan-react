// Type declaration for iconify-icon web component
// This file extends JSX.IntrinsicElements to recognize <iconify-icon> as a valid JSX element

import type { DetailedHTMLProps, HTMLAttributes } from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "iconify-icon": DetailedHTMLProps<
        HTMLAttributes<HTMLElement> & {
          icon: string;
          width?: string | number;
          height?: string | number;
          flip?: string;
          rotate?: string;
          inline?: boolean;
          class?: string;
        },
        HTMLElement
      >;
    }
  }
}
