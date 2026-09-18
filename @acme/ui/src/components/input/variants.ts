import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

const inputDisabledVariants = tv({
  variants: {
    disabled: {
      true: [
        "bg-background-active hover:border-input! cursor-not-allowed opacity-50",
      ],
    },
  },
  defaultVariants: {
    disabled: false,
  },
});
const inputVariants = tv({
  base: [
    "font-normal",
    // disable shadcn focus-visible classes
    "outline-0",
    // "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex w-full min-w-0 rounded-md border bg-transparent px-3 py-1 shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
    "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  ],
  variants: {
    disabled: inputDisabledVariants.variants.disabled,
    // readOnly: {
    //   true: ["pointer-events-none cursor-not-allowed"],
    // },
    status: {
      default: [
        "border-input",
        "hover:border-primary-500",
        "focus-within:border-primary-500 focus-within:ring-primary-500/20",
        "focus-visible:border-primary-500 focus-visible:ring-primary-500/20",
        // Keep the control highlighted while its dropdown is open (combobox
        // trigger loses focus to the popup). aria-expanded covers the Radix
        // Select trigger + the Popover-mode div; inert on plain inputs.
        "aria-expanded:border-primary-500 aria-expanded:ring-primary-500/20",
      ],
      error: [
        "border-error",
        "hover:border-error-hover",
        "focus-within:border-error focus-within:ring-error/20",
        "focus-visible:border-error focus-visible:ring-error/20",
        "aria-expanded:border-error aria-expanded:ring-error/20",
      ],
      warning: [
        "border-warning",
        "hover:border-warning-hover",
        "focus-within:border-warning focus-within:ring-warning/20",
        "focus-visible:border-warning focus-visible:ring-warning/20",
        "aria-expanded:border-warning aria-expanded:ring-warning/20",
      ],
      success: [
        "border-success",
        "hover:border-success-hover",
        "focus-within:border-success focus-within:ring-success/20",
        "focus-visible:border-success focus-visible:ring-success/20",
        "aria-expanded:border-success aria-expanded:ring-success/20",
      ],
    },
    variant: {
      outlined: [
        "border",
        "rounded-md",
        "transition-colors",
        "focus-within:ring-[3px]",
        "aria-expanded:ring-[3px]",
      ],
      filled: [
        "bg-accent rounded-md border-none shadow-none",
        "transition-colors",
      ],
      borderless: ["border-none", "transition-colors"],
      underlined: [
        "border-b",
        "border-t-0 border-r-0 border-l-0",
        "rounded-none",
        "transition-colors",
      ],
    },
  },
  defaultVariants: {
    variant: "outlined",
    status: "default",
    disabled: false,
  },
});
const inputInlineInsetClassName = "pl-3";

// Gap between an inline affix (prefix icon, clear button, chevron) and the
// value. shadcn's InputGroup hardcodes 8px via
// `has-[>[data-align=inline-start]]:[&>input]:pl-2`, sized for its own h-9
// shell; this package replaces that shell with the 24/32/40 control scale in
// controlHeightBySize, where the matching affix gap is 4px (AntD's
// inputAffixPadding = paddingXXS = sizeXXS). BaseInput's non-group branch
// already spaces its affixes with mr-1/ml-1, so 4px is what the other half of
// the same component does. Needs `!`: shadcn's rule is
// `:has(>[data-align=...]) > input`, which outranks a plain utility.
const inputAffixGapClassName =
  "has-[>[data-align=inline-start]]:[&>input]:pl-1! has-[>[data-align=inline-end]]:[&>input]:pr-1!";

// Single source for the size -> control-height/text invariant. Every input-
// family size table (plain input, affix wrapper, InputNumber spinner) derives
// from these; do not restate h-6/h-8/h-10 elsewhere.
const controlHeightBySize = {
  small: "h-6",
  middle: "h-8",
  large: "h-10",
} as const;

const controlTextBySize = {
  small: "",
  middle: "text-sm",
  large: "text-base",
} as const;

// Single source for the size -> border-radius invariant, applied to the OUTER
// control box (where inputVariants' rounded-md lives). Repo --radius scale:
// rounded-sm=6px, rounded-md=8px (default/middle), rounded-lg=10px. Small feels
// sharper, large softer; middle stays at the current rounded-md.
const controlRadiusBySize = {
  small: "rounded-sm",
  middle: "rounded-md",
  large: "rounded-lg",
} as const;

// Inline half of controlPaddingBySize. Needed on its own when an outer box owns
// the height/vertical padding but the inline inset still has to be applied to
// the inner control — e.g. an input with addons, where the addons must touch the
// border (wrapper is p-0) while the value must stay inset.
const controlPaddingXBySize = {
  small: "px-2",
  middle: "px-3",
  large: "px-3",
} as const;

// Single source for size -> control padding. Shared by inputSizeVariants and
// the Select trigger so every control (input, autocomplete, datepicker, select)
// pads identically; do not restate px-2/px-3 elsewhere.
const controlPaddingBySize = {
  small: `${controlPaddingXBySize.small} py-1`,
  middle: `${controlPaddingXBySize.middle} py-1`,
  large: `${controlPaddingXBySize.large} py-2`,
} as const;

const inputAffixWrapperSizeVariants = tv({
  variants: {
    size: controlHeightBySize,
  },
  defaultVariants: {
    size: "middle",
  },
});

const inputSizeVariants = tv({
  variants: {
    size: {
      small: [controlHeightBySize.small, controlPaddingBySize.small],
      middle: [
        controlHeightBySize.middle,
        controlPaddingBySize.middle,
        controlTextBySize.middle,
      ],
      large: [
        controlHeightBySize.large,
        controlPaddingBySize.large,
        controlTextBySize.large,
      ],
    },
  },
  defaultVariants: {
    size: "middle",
  },
});
type InputVariants = VariantProps<typeof inputVariants>;
type InputSizeVariants = VariantProps<typeof inputSizeVariants>;
type InputVariant = VariantProps<typeof inputVariants>["variant"];
type InputStatus = VariantProps<typeof inputVariants>["status"];

export type { InputVariants, InputSizeVariants, InputVariant, InputStatus };
export {
  inputVariants,
  inputDisabledVariants,
  inputInlineInsetClassName,
  inputAffixGapClassName,
  inputAffixWrapperSizeVariants,
  inputSizeVariants,
  controlHeightBySize,
  controlTextBySize,
  controlRadiusBySize,
  controlPaddingBySize,
  controlPaddingXBySize,
};
