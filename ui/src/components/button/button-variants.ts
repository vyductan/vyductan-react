import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const buttonVariants = tv({
  base: [
    "inline-flex shrink-0 items-center justify-center gap-2 border text-sm font-medium whitespace-nowrap ring-offset-white transition-all outline-none",
    // "disabled:pointer-events-none disabled:opacity-50",
    // "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", // moved to &_span
    "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
    "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
    // own
    // "shrink-0", // disable flex box sizing - added by shadcn
    "[&_span[role='img']]:pointer-events-none [&_span[role='img']]:shrink-0 [&_span[role='img']:not([class*='size-'])]:size-4",
  ],
  variants: {
    action: {
      true: [],
    },

    size: {
      small: "h-6 gap-1.5 rounded-sm px-2 py-0",
      middle: "h-8 rounded-md px-[15px] has-[>svg]:px-2.5",
      large: "h-10 rounded-lg px-4 py-2 has-[>svg]:px-4",
    },
    shape: {
      default: "",
      icon: [
        'sm:has-[span[class*="sm::not-sr-only"]]:w-auto',
        'max-sm:has-[span[class*="sm::not-sr-only"]]:p-0',
        '[&:not(:has(span[class*="sm::not-sr-only"]))]:p-0',
      ],
      circle: "rounded-full",
    },
    /* Whenever to hidden text at mobile view */
    srOnly: {
      true: "",
      false: "",
    },
  },
  compoundVariants: [
    // Size
    {
      size: "small",
      shape: ["icon", "circle"],
      className: "w-6",
    },
    {
      size: "middle",
      shape: ["icon", "circle"],
      className: "size-8",
    },
    {
      size: "large",
      shape: ["icon", "circle"],
      className: "w-10",
    },
  ],
  defaultVariants: {
    size: "middle",
    shape: "default",
  },
});

export type ButtonColorVariants = VariantProps<typeof buttonColorVariants>;

export const buttonColorVariants = tv({
  variants: {
    disabled: {
      true: "cursor-not-allowed",
    },
    variant: {
      solid: ["text-white", "hover:text-white"],
      outlined: [
        "border-input bg-background hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 border shadow-xs",
      ],
      dashed: [],
      filled: ["border-transparent", "hover:bg-background-hover"],
      link: ["border-transparent"],
      text: "border-transparent",
    },
    color: {
      default: [],
      primary: [],
      danger: [],
      link: [],
      success: [],
      gray: [],
      red: [],
      orange: [],
      amber: [],
      yellow: [],
      lime: [],
      green: [],
      emerald: [],
      teal: [],
      cyan: [],
      sky: [],
      blue: [],
      indigo: [],
      violet: [],
      purple: [],
      fuchsia: [],
      pink: [],
      rose: [],
    },
  },
  compoundVariants: [
    // solid
    {
      variant: "solid",
      color: "default",
      className: [
        "border-button-solid bg-button-solid",
        "hover:border-button-solid-hover hover:bg-button-solid-hover",
        "active:border-button-solid-active active:bg-button-solid-active",
      ],
    },
    {
      variant: "solid",
      color: "primary",
      className: [
        "border-primary bg-primary",
        "hover:border-primary-hover hover:bg-primary-hover",
        "active:border-primary-active active:bg-primary-active",
      ],
    },
    {
      variant: "solid",
      color: "danger",
      className: [
        "border-red-600 bg-red-600",
        "hover:border-red-500 hover:bg-red-500",
        "active:border-red-700 active:bg-red-700",
      ],
    },
    {
      variant: "solid",
      color: "orange",
      className: [
        "border-orange-600 bg-orange-600",
        "hover:border-orange-500 hover:bg-orange-500",
        "active:border-orange-700 active:bg-orange-700",
      ],
    },
    {
      variant: "solid",
      color: "green",
      className: [
        "border-green-600 bg-green-600",
        "hover:border-green-500 hover:bg-green-500",
        "active:border-green-700 active:bg-green-700",
      ],
    },
    {
      variant: "solid",
      color: "emerald",
      className: [
        "border-emerald-600 bg-emerald-600",
        "hover:border-emerald-500 hover:bg-emerald-500",
        "active:border-emerald-700 active:bg-emerald-700",
      ],
    },
    {
      variant: "solid",
      color: "cyan",
      className: [
          "border-cyan-600 bg-cyan-600",
        "hover:border-cyan-500 hover:bg-cyan-500",
        "active:border-cyan-700 active:bg-cyan-700",
      ],
    },
    {
      variant: "solid",
      color: "teal",
      className: [
        "border-teal-600 bg-teal-600",
        "hover:border-teal-500 hover:bg-teal-500",
        "active:border-teal-700 active:bg-teal-700",
      ],
    },
    {
      variant: "solid",
      color: "blue",
      className: [
        "border-blue-600 bg-blue-600",
        "hover:border-blue-500 hover:bg-blue-500",
        "active:border-blue-700 active:bg-blue-700",
      ],
    },
    {
      variant: "solid",
      color: "indigo",
      className: [
        "border-indigo-600 bg-indigo-600",
        "hover:border-indigo-500 hover:bg-indigo-500",
        "active:border-indigo-700 active:bg-indigo-700",
      ],
    },
    {
      variant: "solid",
      color: "purple",
      className: [
        "border-purple-600 bg-purple-600",
        "hover:border-purple-500 hover:bg-purple-500",
        "active:border-purple-700 active:bg-purple-700",
      ],
    },
    {
      variant: "solid",
      color: "pink",
      className: [
        "border-pink-600 bg-pink-600",
        "hover:border-pink-500 hover:bg-pink-500",
        "active:border-pink-700 active:bg-pink-700",
      ],
    },
    {
      variant: "solid",
      color: "link",
      className: [
        "border-blue-600 bg-blue-600",
        "hover:border-blue-500 hover:bg-blue-500",
        "active:border-blue-700 active:bg-blue-700",
      ],
    },
    {
      variant: "solid",
      color: "success",
      className: [
        "border-green-600 bg-green-600",
        "hover:border-green-500 hover:bg-green-500",
        "active:border-green-700 active:bg-green-700",
      ],
    },
    {
      variant: "solid",
      color: "gray",
      className: [
        "border-gray-600 bg-gray-600",
        "hover:border-gray-500 hover:bg-gray-500",
        "active:border-gray-700 active:bg-gray-700",
      ],
    },
    {
      variant: "solid",
      color: "red",
      className: [
        "border-red-600 bg-red-600",
        "hover:border-red-500 hover:bg-red-500",
        "active:border-red-700 active:bg-red-700",
      ],
    },
    {
      variant: "solid",
      color: "amber",
      className: [
        "border-amber-600 bg-amber-600",
        "hover:border-amber-500 hover:bg-amber-500",
        "active:border-amber-700 active:bg-amber-700",
      ],
    },
    {
      variant: "solid",
      color: "yellow",
      className: [
        "border-yellow-600 bg-yellow-600",
        "hover:border-yellow-500 hover:bg-yellow-500",
        "active:border-yellow-700 active:bg-yellow-700",
      ],
    },
    {
      variant: "solid",
      color: "lime",
      className: [
        "border-lime-600 bg-lime-600",
        "hover:border-lime-500 hover:bg-lime-500",
        "active:border-lime-700 active:bg-lime-700",
      ],
    },
    {
      variant: "solid",
      color: "sky",
      className: [
        "border-sky-600 bg-sky-600",
        "hover:border-sky-500 hover:bg-sky-500",
        "active:border-sky-700 active:bg-sky-700",
      ],
    },
    {
      variant: "solid",
      color: "violet",
      className: [
        "border-violet-600 bg-violet-600",
        "hover:border-violet-500 hover:bg-violet-500",
        "active:border-violet-700 active:bg-violet-700",
      ],
    },
    {
      variant: "solid",
      color: "fuchsia",
      className: [
        "border-fuchsia-600 bg-fuchsia-600",
        "hover:border-fuchsia-500 hover:bg-fuchsia-500",
        "active:border-fuchsia-700 active:bg-fuchsia-700",
      ],
    },
    {
      variant: "solid",
      color: "rose",
      className: [
        "border-rose-600 bg-rose-600",
        "hover:border-rose-500 hover:bg-rose-500",
        "active:border-rose-700 active:bg-rose-700",
      ],
    },
    // outlined
    {
      variant: "outlined",
      color: "default",
      className: [
        "",
        "hover:border-primary-hover hover:text-primary-hover",
        "active:border-primary-active active:text-primary-active",
      ],
    },
    {
      variant: "outlined",
      color: "primary",
      className: [
        "border-primary text-primary",
        "hover:border-primary-hover hover:text-primary-hover",
        "active:border-primary-active active:text-primary-active",
      ],
    },
    {
      variant: "outlined",
      color: "link",
      className: ["text-link", "hover:bg-link-hover hover:text-white"],
    },
    {
      variant: "outlined",
      color: "danger",
      className: [
        "border-red-600 text-red-600",
        "hover:border-red-500 hover:text-red-500",
        "active:border-red-700 active:text-red-700",
      ],
    },
    {
      variant: "outlined",
      color: "orange",
      className: [
        "border-orange-600 text-orange-600",
        "hover:border-orange-500 hover:text-orange-500",
        "active:border-orange-700 active:text-orange-700",
      ],
    },
    {
      variant: "outlined",
      color: "green",
      className: [
        "border-green-600 text-green-600",
        "hover:border-green-500 hover:text-green-500",
        "active:border-green-700 active:text-green-700",
      ],
    },
    {
      variant: "outlined",
      color: "emerald",
      className: [
        "border-emerald-600 text-emerald-600",
        "hover:border-emerald-500 hover:text-emerald-500",
        "active:border-emerald-700 active:text-emerald-700",
      ],
    },
    {
      variant: "outlined",
      color: "cyan",
      className: [
        "border-cyan-600 text-cyan-600",
        "hover:border-cyan-500 hover:text-cyan-500",
        "active:border-cyan-700 active:text-cyan-700",
      ],
    },
    {
      variant: "outlined",
      color: "teal",
      className: [
        "border-teal-600 text-teal-600",
        "hover:border-teal-500 hover:text-teal-500",
        "active:border-teal-700 active:text-teal-700",
      ],
    },
    {
      variant: "outlined",
      color: "blue",
      className: [
        "border-blue-600 text-blue-600",
        "hover:border-blue-500 hover:text-blue-500",
        "active:border-blue-700 active:text-blue-700",
      ],
    },
    {
      variant: "outlined",
      color: "indigo",
      className: [
        "border-indigo-600 text-indigo-600",
        "hover:border-indigo-500 hover:text-indigo-500",
        "active:border-indigo-700 active:text-indigo-700",
      ],
    },
    {
      variant: "outlined",
      color: "purple",
      className: [
        "border-purple-600 text-purple-600",
        "hover:border-purple-500 hover:text-purple-500",
        "active:border-purple-700 active:text-purple-700",
      ],
    },
    {
      variant: "outlined",
      color: "pink",
      className: [
        "border-pink-600 text-pink-600",
        "hover:border-pink-500 hover:text-pink-500",
        "active:border-pink-700 active:text-pink-700",
      ],
    },
    {
      variant: "outlined",
      color: "success",
      className: [
        "border-green-600 text-green-600",
        "hover:border-green-500 hover:text-green-500",
        "active:border-green-700 active:text-green-700",
      ],
    },
    {
      variant: "outlined",
      color: "gray",
      className: [
        "border-gray-600 text-gray-600",
        "hover:border-gray-500 hover:text-gray-500",
        "active:border-gray-700 active:text-gray-700",
      ],
    },
    {
      variant: "outlined",
      color: "red",
      className: [
        "border-red-600 text-red-600",
        "hover:border-red-500 hover:text-red-500",
        "active:border-red-700 active:text-red-700",
      ],
    },
    {
      variant: "outlined",
      color: "amber",
      className: [
        "border-amber-600 text-amber-600",
        "hover:border-amber-500 hover:text-amber-500",
        "active:border-amber-700 active:text-amber-700",
      ],
    },
    {
      variant: "outlined",
      color: "yellow",
      className: [
        "border-yellow-600 text-yellow-600",
        "hover:border-yellow-500 hover:text-yellow-500",
        "active:border-yellow-700 active:text-yellow-700",
      ],
    },
    {
      variant: "outlined",
      color: "lime",
      className: [
        "border-lime-600 text-lime-600",
        "hover:border-lime-500 hover:text-lime-500",
        "active:border-lime-700 active:text-lime-700",
      ],
    },
    {
      variant: "outlined",
      color: "sky",
      className: [
        "border-sky-600 text-sky-600",
        "hover:border-sky-500 hover:text-sky-500",
        "active:border-sky-700 active:text-sky-700",
      ],
    },
    {
      variant: "outlined",
      color: "violet",
      className: [
        "border-violet-600 text-violet-600",
        "hover:border-violet-500 hover:text-violet-500",
        "active:border-violet-700 active:text-violet-700",
      ],
    },
    {
      variant: "outlined",
      color: "fuchsia",
      className: [
        "border-fuchsia-600 text-fuchsia-600",
        "hover:border-fuchsia-500 hover:text-fuchsia-500",
        "active:border-fuchsia-700 active:text-fuchsia-700",
      ],
    },
    {
      variant: "outlined",
      color: "rose",
      className: [
        "border-rose-600 text-rose-600",
        "hover:border-rose-500 hover:text-rose-500",
        "active:border-rose-700 active:text-rose-700",
      ],
    },
    // filled | light
    {
      variant: "filled",
      color: "default",
      className: [
        "bg-secondary",
        "hover:bg-secondary-hover",
        "active:bg-secondary-active",
      ],
    },
    {
      variant: "filled",
      color: "primary",
      className: [
        "bg-primary-50 text-primary",
        "hover:bg-primary-100 hover:text-primary",
        "active:bg-primary-200 active:text-primary-active",
      ],
    },
    {
      variant: "filled",
      color: "danger",
      className: [
        "bg-red-50 text-red-600",
        "hover:bg-red-100 hover:text-red-600",
        "active:bg-red-200 active:text-red-700",
      ],
    },
    {
      variant: "filled",
      color: "orange",
      className: [
        "bg-orange-50 text-orange-600",
        "hover:bg-orange-100 hover:text-orange-600",
        "active:bg-orange-200 active:text-orange-700",
      ],
    },
    {
      variant: "filled",
      color: "green",
      className: [
        "bg-green-50 text-green-600",
        "hover:bg-green-100 hover:text-green-600",
        "active:bg-green-200 active:text-green-700",
      ],
    },
    {
      variant: "filled",
      color: "emerald",
      className: [
        "bg-emerald-50 text-emerald-600",
        "hover:bg-emerald-100 hover:text-emerald-600",
        "active:bg-emerald-200 active:text-emerald-700",
      ],
    },
    {
      variant: "filled",
      color: "cyan",
      className: [
        "bg-cyan-50 text-cyan-600",
        "hover:bg-cyan-100 hover:text-cyan-600",
        "active:bg-cyan-200 active:text-cyan-700",
      ],
    },
    {
      variant: "filled",
      color: "teal",
      className: [
        "bg-teal-50 text-teal-600",
        "hover:bg-teal-100 hover:text-teal-600",
        "active:bg-teal-200 active:text-teal-700",
      ],
    },
    {
      variant: "filled",
      color: "blue",
      className: [
        "bg-blue-50 text-blue-600",
        "hover:bg-blue-100 hover:text-blue-600",
        "active:bg-blue-200 active:text-blue-700",
      ],
    },
    {
      variant: "filled",
      color: "indigo",
      className: [
        "bg-indigo-50 text-indigo-600",
        "hover:bg-indigo-100 hover:text-indigo-600",
        "active:bg-indigo-200 active:text-indigo-700",
      ],
    },
    {
      variant: "filled",
      color: "link",
      className: [
        "text-blue-600 bg-blue-50",
        "hover:bg-blue-100 hover:text-blue-600",
        "active:bg-blue-200 active:text-blue-700",
      ],
    },
    {
      variant: "filled",
      color: "purple",
      className: [
        "bg-purple-50 text-purple-600",
        "hover:bg-purple-100 hover:text-purple-600",
        "active:bg-purple-200 active:text-purple-700",
      ],
    },
    {
      variant: "filled",
      color: "pink",
      className: [
        "bg-pink-50 text-pink-600",
        "hover:bg-pink-100 hover:text-pink-600",
        "active:bg-pink-200 active:text-pink-700",
      ],
    },
    {
      variant: "filled",
      color: "success",
      className: [
        "bg-green-50 text-green-600",
        "hover:bg-green-100 hover:text-green-600",
        "active:bg-green-200 active:text-green-700",
      ],
    },
    {
      variant: "filled",
      color: "gray",
      className: [
        "bg-gray-50 text-gray-600",
        "hover:bg-gray-100 hover:text-gray-600",
        "active:bg-gray-200 active:text-gray-700",
      ],
    },
    {
      variant: "filled",
      color: "red",
      className: [
        "bg-red-50 text-red-600",
        "hover:bg-red-100 hover:text-red-600",
        "active:bg-red-200 active:text-red-700",
      ],
    },
    {
      variant: "filled",
      color: "amber",
      className: [
        "bg-amber-50 text-amber-600",
        "hover:bg-amber-100 hover:text-amber-600",
        "active:bg-amber-200 active:text-amber-700",
      ],
    },
    {
      variant: "filled",
      color: "yellow",
      className: [
        "bg-yellow-50 text-yellow-600",
        "hover:bg-yellow-100 hover:text-yellow-600",
        "active:bg-yellow-200 active:text-yellow-700",
      ],
    },
    {
      variant: "filled",
      color: "lime",
      className: [
        "bg-lime-50 text-lime-600",
        "hover:bg-lime-100 hover:text-lime-600",
        "active:bg-lime-200 active:text-lime-700",
      ],
    },
    {
      variant: "filled",
      color: "sky",
      className: [
        "bg-sky-50 text-sky-600",
        "hover:bg-sky-100 hover:text-sky-600",
        "active:bg-sky-200 active:text-sky-700",
      ],
    },
    {
      variant: "filled",
      color: "violet",
      className: [
        "bg-violet-50 text-violet-600",
        "hover:bg-violet-100 hover:text-violet-600",
        "active:bg-violet-200 active:text-violet-700",
      ],
    },
    {
      variant: "filled",
      color: "fuchsia",
      className: [
        "bg-fuchsia-50 text-fuchsia-600",
        "hover:bg-fuchsia-100 hover:text-fuchsia-600",
        "active:bg-fuchsia-200 active:text-fuchsia-700",
      ],
    },
    {
      variant: "filled",
      color: "rose",
      className: [
        "bg-rose-50 text-rose-600",
        "hover:bg-rose-100 hover:text-rose-600",
        "active:bg-rose-200 active:text-rose-700",
      ],
    },
    // Text
    {
      variant: "text",
      color: "default",
      className: ["", "hover:bg-secondary", "active:bg-secondary-active"],
    },
    {
      variant: "text",
      color: "primary",
      className: [
        "text-primary",
        "hover:bg-primary-100 hover:text-primary-hover",
        "active:bg-primary-300 active:text-primary-active",
      ],
    },
    {
      variant: "text",
      color: "danger",
      className: [
        "text-red-600",
        "hover:bg-red-100 hover:text-red-500",
        "active:bg-red-300 active:text-red-700",
      ],
    },
    {
      variant: "text",
      color: "green",
      className: [
        "text-green-600",
        "hover:bg-green-100 hover:text-green-500",
        "active:bg-green-300 active:text-green-700",
      ],
    },
    {
      variant: "text",
      color: "emerald",
      className: [
        "text-emerald-600",
        "hover:bg-emerald-100 hover:text-emerald-500",
        "active:bg-emerald-300 active:text-emerald-700",
      ],
    },
    {
      variant: "text",
      color: "cyan",
      className: [
        "text-cyan-600",
        "hover:bg-cyan-100 hover:text-cyan-500",
        "active:bg-cyan-300 active:text-cyan-700",
      ],
    },
    {
      variant: "text",
      color: "teal",
      className: [
        "text-teal-600",
        "hover:bg-teal-100 hover:text-teal-500",
        "active:bg-teal-300 active:text-teal-700",
      ],
    },
    {
      variant: "text",
      color: "blue",
      className: [
        "text-blue-600",
        "hover:bg-blue-100 hover:text-blue-500",
        "active:bg-blue-300 active:text-blue-700",
      ],
    },
    {
      variant: "text",
      color: "indigo",
      className: [
        "text-indigo-600",
        "hover:bg-indigo-100 hover:text-indigo-500",
        "active:bg-indigo-300 active:text-indigo-700",
      ],
    },
    {
      variant: "text",
      color: "purple",
      className: [
        "text-purple-600",
        "hover:bg-purple-100 hover:text-purple-500",
        "active:bg-purple-300 active:text-purple-700",
      ],
    },
    {
      variant: "text",
      color: "pink",
      className: [
        "text-pink-600",
        "hover:bg-pink-100 hover:text-pink-500",
        "active:bg-pink-300 active:text-pink-700",
      ],
    },
    {
      variant: "text",
      color: "link",
      className: [
        "text-blue-600",
        "hover:bg-blue-100 hover:text-blue-500",
        "active:bg-blue-300 active:text-blue-700",
      ],
    },
    {
      variant: "text",
      color: "success",
      className: [
        "text-green-600",
        "hover:bg-green-100 hover:text-green-500",
        "active:bg-green-300 active:text-green-700",
      ],
    },
    {
      variant: "text",
      color: "gray",
      className: [
        "text-gray-600",
        "hover:bg-gray-100 hover:text-gray-500",
        "active:bg-gray-300 active:text-gray-700",
      ],
    },
    {
      variant: "text",
      color: "red",
      className: [
        "text-red-600",
        "hover:bg-red-100 hover:text-red-500",
        "active:bg-red-300 active:text-red-700",
      ],
    },
    {
      variant: "text",
      color: "orange",
      className: [
        "text-orange-600",
        "hover:bg-orange-100 hover:text-orange-500",
        "active:bg-orange-300 active:text-orange-700",
      ],
    },
    {
      variant: "text",
      color: "amber",
      className: [
        "text-amber-600",
        "hover:bg-amber-100 hover:text-amber-500",
        "active:bg-amber-300 active:text-amber-700",
      ],
    },
    {
      variant: "text",
      color: "yellow",
      className: [
        "text-yellow-600",
        "hover:bg-yellow-100 hover:text-yellow-500",
        "active:bg-yellow-300 active:text-yellow-700",
      ],
    },
    {
      variant: "text",
      color: "lime",
      className: [
        "text-lime-600",
        "hover:bg-lime-100 hover:text-lime-500",
        "active:bg-lime-300 active:text-lime-700",
      ],
    },
    {
      variant: "text",
      color: "sky",
      className: [
        "text-sky-600",
        "hover:bg-sky-100 hover:text-sky-500",
        "active:bg-sky-300 active:text-sky-700",
      ],
    },
    {
      variant: "text",
      color: "violet",
      className: [
        "text-violet-600",
        "hover:bg-violet-100 hover:text-violet-500",
        "active:bg-violet-300 active:text-violet-700",
      ],
    },
    {
      variant: "text",
      color: "fuchsia",
      className: [
        "text-fuchsia-600",
        "hover:bg-fuchsia-100 hover:text-fuchsia-500",
        "active:bg-fuchsia-300 active:text-fuchsia-700",
      ],
    },
    {
      variant: "text",
      color: "rose",
      className: [
        "text-rose-600",
        "hover:bg-rose-100 hover:text-rose-500",
        "active:bg-rose-300 active:text-rose-700",
      ],
    },

    // Link
    {
      variant: "link",
      color: "default",
      className: ["", "hover:text-primary-hover", "active:text-primary-active"],
    },
    {
      variant: "link",
      color: "primary",
      className: [
        "text-primary",
        "hover:text-primary-hover",
        "active:text-primary-active",
      ],
    },
    {
      variant: "link",
      color: "link",
      className: [
        "text-primary",
        "hover:text-primary-hover",
        "active:text-primary-active",
      ],
    },
    {
      variant: "link",
      color: "danger",
      className: ["text-red-500", "hover:text-red-400", "active:text-red-600"],
    },
    {
      variant: "link",
      color: "pink",
      className: [
        "text-pink-500",
        "hover:text-pink-400",
        "active:text-pink-600",
      ],
    },
    {
      variant: "link",
      color: "purple",
      className: [
        "text-purple-500",
        "hover:text-purple-400",
        "active:text-purple-600",
      ],
    },
    {
      variant: "link",
      color: "cyan",
      className: [
        "text-cyan-500",
        "hover:text-cyan-400",
        "active:text-cyan-600",
      ],
    },
    {
      variant: "link",
      color: "teal",
      className: [
        "text-teal-500",
        "hover:text-teal-400",
        "active:text-teal-600",
      ],
    },
    {
      variant: "link",
      color: "orange",
      className: [
        "text-orange-500",
        "hover:text-orange-400",
        "active:text-orange-600",
      ],
    },
    {
      variant: "link",
      color: "amber",
      className: [
        "text-amber-500",
        "hover:text-amber-400",
        "active:text-amber-600",
      ],
    },
    {
      variant: "link",
      color: "yellow",
      className: [
        "text-yellow-500",
        "hover:text-yellow-400",
        "active:text-yellow-600",
      ],
    },
    {
      variant: "link",
      color: "lime",
      className: [
        "text-lime-500",
        "hover:text-lime-400",
        "active:text-lime-600",
      ],
    },
    {
      variant: "link",
      color: "green",
      className: [
        "text-green-500",
        "hover:text-green-400",
        "active:text-green-600",
      ],
    },
    {
      variant: "link",
      color: "emerald",
      className: [
        "text-emerald-500",
        "hover:text-emerald-400",
        "active:text-emerald-600",
      ],
    },
    {
      variant: "link",
      color: "sky",
      className: ["text-sky-500", "hover:text-sky-400", "active:text-sky-600"],
    },
    {
      variant: "link",
      color: "blue",
      className: [
        "text-blue-500",
        "hover:text-blue-400",
        "active:text-blue-600",
      ],
    },
    {
      variant: "link",
      color: "indigo",
      className: [
        "text-indigo-500",
        "hover:text-indigo-400",
        "active:text-indigo-600",
      ],
    },
    {
      variant: "link",
      color: "violet",
      className: [
        "text-violet-500",
        "hover:text-violet-400",
        "active:text-violet-600",
      ],
    },
    {
      variant: "link",
      color: "fuchsia",
      className: [
        "text-fuchsia-500",
        "hover:text-fuchsia-400",
        "active:text-fuchsia-600",
      ],
    },
    {
      variant: "link",
      color: "rose",
      className: [
        "text-rose-500",
        "hover:text-rose-400",
        "active:text-rose-600",
      ],
    },
    {
      variant: "link",
      color: "red",
      className: ["text-red-500", "hover:text-red-400", "active:text-red-600"],
    },
    {
      variant: "link",
      color: "success",
      className: [
        "text-green-500",
        "hover:text-green-400",
        "active:text-green-600",
      ],
    },
    {
      variant: "link",
      color: "gray",
      className: [
        "text-gray-500",
        "hover:text-gray-400",
        "active:text-gray-600",
      ],
    },
    // Disabled states - use muted colors instead of opacity
    {
      disabled: true,
      variant: "solid",
      className: [
        "bg-muted/80 border-input text-muted-foreground/50",
        "hover:!bg-muted/80 hover:!border-input hover:!text-muted-foreground/50",
        "active:!bg-muted/80 active:!border-input active:!text-muted-foreground/50",
      ],
    },
    {
      disabled: true,
      variant: "outlined",
      className: [
        "border-input text-muted-foreground/50 bg-muted/80",
        "hover:!border-input hover:!text-muted-foreground/50 hover:!bg-muted/80",
        "active:!border-input active:!text-muted-foreground/50 active:!bg-muted/80",
      ],
    },
    {
      disabled: true,
      variant: "filled",
      className: [
        "bg-muted/80 text-muted-foreground/50 border-transparent",
        "hover:!bg-muted/80 hover:!text-muted-foreground/50 hover:!border-transparent",
        "active:!bg-muted/80 active:!text-muted-foreground/50 active:!border-transparent",
      ],
    },
    {
      disabled: true,
      variant: "text",
      className: [
        "text-muted-foreground/50 border-transparent bg-transparent",
        "hover:!text-muted-foreground/50 hover:!border-transparent hover:!bg-transparent",
        "active:!text-muted-foreground/50 active:!border-transparent active:!bg-transparent",
      ],
    },
    {
      disabled: true,
      variant: "link",
      className: [
        "text-muted-foreground/50 border-transparent",
        "hover:!text-muted-foreground/50 hover:!border-transparent",
        "active:!text-muted-foreground/50 active:!border-transparent",
      ],
    },
  ],
});

export type ButtonVariants = VariantProps<typeof buttonVariants>;
