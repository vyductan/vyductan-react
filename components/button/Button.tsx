import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

import { clsm } from "@vyductan/utils";

import Spin from "../spin";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center font-medium ring-offset-white transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "dark:ring-offset-gray-950 dark:focus-visible:ring-gray-300",
  ],
  {
    variants: {
      color: {
        default: [],
        danger: [
          "bg-red-500",
          "hover:bg-red-500/90",
          "active:ring-red-200",
          "dark:bg-red-900",
          "dark:hover:bg-red-900/90",
        ],
      },
      type: {
        primary: [
          "text-white bg-primary",
          "hover:bg-primary-hover",
          "active:ring-primary-border",
        ],
        default: [
          // "text-primary",
          "border border-border hover:text-primary-hover",
          "hover:border-primary-hover",
        ],
        // default: [
        //   "bg-gray-900 text-gray-50",
        //   "hover:bg-gray-900/90",
        //   "dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90",
        // ],

        // secondary:
        // "bg-gray-100 text-gray-900 hover:bg-gray-100/80 dark:bg-gray-800 dark:text-gray-50 dark:hover:bg-gray-800/80",
        ghost:
          "hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-50",
        "ghost-action": ["text-blue-500"],
        "ghost-danger": [
          "text-red-500",
          "hover:bg-red-500/90 hover:text-gray-50",
          "dark:text-red-600",
          "dark:hover:bg-red-900/90 dark:hover:text-gray-50",
        ],
        link: "text-gray-900 underline-offset-4 hover:underline dark:text-gray-50",
      },
      size: {
        xs: "h-xs rounded-xs px-2 py-0 text-sm",
        sm: "h-sm rounded-sm px-3 py-1 text-sm",
        default: "h-md rounded-md px-4 py-2 text-md",
        lg: "h-lg rounded-sm px-3 py-1 text-sm",
        xl: "h-xl px-4 text-xl",
      },
    },
    defaultVariants: {
      type: "default",
      color: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color" | "type">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  htmlType?: React.ButtonHTMLAttributes<HTMLButtonElement>["type"];
  loading?: boolean;
  icon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      asChild = false,
      children,
      className,
      color,
      disabled,
      htmlType,
      loading,
      size,
      type,
      icon,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={clsm(
          buttonVariants({ color, type, size, className }),
          icon && !children
            ? !size || size === "default"
              ? "w-10"
              : size === "sm"
              ? "w-8"
              : ""
            : "",
        )}
        disabled={loading ?? disabled}
        type={htmlType}
        {...props}
      >
        {icon && (
          <span
            className={clsm(children && "mr-2")}
            onClick={() => {
              console.log(icon, children, size);
            }}
          >
            {icon}
          </span>
        )}
        {children}
      </Comp>
      // {/* {loading ? <Spin /> : null} */}
      // {/* </Comp> */}
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
