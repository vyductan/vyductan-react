import type { DetailedHTMLProps, HTMLAttributes } from "react";

import "iconify-icon";

import { cn } from "@acme/ui/lib/utils";

declare module "react" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "iconify-icon": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
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

// https://icon-sets.iconify.design/
export type IconProps = DetailedHTMLProps<
  HTMLAttributes<HTMLSpanElement>,
  HTMLSpanElement
> & {
  icon: string;
  srOnly?: string;
  /**
   * Use iconify-icon web component for on-demand loading from Iconify API.
   * This is useful for dynamic icon names that can't be statically analyzed.
   */
  demand?: boolean;
};

// Normalize icon name for iconify-icon web component
const normalizeIconName = (icon: string): string => {
  // Remove icon-[ prefix and ] suffix if present
  let normalized = icon.replace(/^icon-\[/, "").replace(/\]$/, "");

  // if not has "--" auto add "lucide:"
  if (!normalized.includes("--") && !normalized.includes(":")) {
    normalized = `lucide:${normalized}`;
  }

  // Convert lucide-- to lucide:
  normalized = normalized.replace(/^lucide--/, "lucide:");

  return normalized;
};

export const Icon = ({
  icon,
  className,
  srOnly,
  demand = false,
  style,
  ...props
}: IconProps) => {
  if (demand) {
    // Use iconify-icon web component for on-demand loading
    const normalizedIcon = normalizeIconName(icon);

    return (
      <>
        <iconify-icon
          icon={normalizedIcon}
          class={cn("block size-4", className)}
          style={style}
          {...props}
        />
        {srOnly && <span className="sr-only">{srOnly}</span>}
      </>
    );
  }

  // Use Tailwind class-based approach
  return (
    <>
      <span
        role="img"
        className={cn(icon, "block size-4", className)}
        style={style}
        {...props}
      ></span>
      {srOnly && <span className="sr-only">{srOnly}</span>}
    </>
  );
};
