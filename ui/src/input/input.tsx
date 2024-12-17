"use client";

import type { VariantProps } from "class-variance-authority";
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { useHover } from "ahooks";
import { cva } from "class-variance-authority";
import { useMergedState } from "rc-util";

import { cn } from "..";
import { triggerNativeEventFor } from "../_util/event";
import { Icon } from "../icons";

export const inputVariants = cva(
  [
    // "h-9",
    "rounded-md border border-input bg-transparent px-3 py-1 shadow-sm transition-colors",
    // "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
    // "placeholder:text-muted-foreground",
    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
    // "disabled:cursor-not-allowed disabled:opacity-50",
    "md:text-sm",

    "flex w-full",

    "items-center border border-input ring-offset-background",
    "focus-within:outline-none",
  ],
  {
    variants: {
      borderless: {
        true: ["border-0", "focus-within:outline-none"],
        false: ["border", "rounded-md", "focus-within:ring-2"],
      },
      disabled: {
        true: [
          "cursor-not-allowed bg-background-active opacity-50 hover:!border-input",
        ],
      },
      // readOnly: {
      //   true: ["pointer-events-none cursor-not-allowed"],
      // },
      status: {
        default: [
          "hover:border-primary-500",
          "focus-within:border-primary-600 focus-within:ring-primary-100",
        ],
        error: [
          "border-error text-error",
          "hover:border-error-hover",
          "focus-within:border-error focus-within:ring-error-muted",
        ],
        warning: [],
      },
    },
    defaultVariants: {
      borderless: false,
      status: "default",
      disabled: false,
    },
  },
);
export const inputSizeVariants = cva([], {
  variants: {
    size: {
      sm: "",
      default: "h-8 px-[11px] py-[5px]",
      lg: "px-[11px] py-[9px]",
      xl: "px-[11px] py-[13px]",
    },
  },
  defaultVariants: {
    size: "default",
  },
});
type InputVariants = Omit<VariantProps<typeof inputVariants>, "disabled"> & {
  disabled?: boolean;
};
type InputProps = Omit<React.ComponentProps<"input">, "size" | "prefix"> &
  InputVariants &
  VariantProps<typeof inputSizeVariants> & {
    /** If allow to remove input content with clear icon */
    allowClear?: boolean | { clearIcon: React.ReactNode };
    prefix?: React.ReactNode;
    suffix?: React.ReactNode;
    addonBefore?: React.ReactNode;
    addonAfter?: React.ReactNode;
    // classNames?: {
    //   wrapper?: string;
    // };
    "data-state"?: boolean;
  };
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      borderless,
      className,
      // classNames,
      disabled,
      hidden,
      size,
      status,

      allowClear,
      addonBefore,
      addonAfter,
      prefix,
      suffix,

      onChange,

      // Popover Props
      "aria-haspopup": ariaHasPopup,
      "aria-expanded": ariaExpanded,
      "aria-controls": ariaControls,
      "data-state": dataState,

      // Input Props
      id: idProp,
      type,
      name,
      value: valueProp,
      defaultValue: defaultValueProp,
      // Wrapper Props
      onClick,
      ...rest
    },
    ref,
  ) => {
    const _id = React.useId();
    const id = idProp ?? _id;

    const inputRef = React.useRef<HTMLInputElement>(null);
    const wrapperRef = React.useRef(null);

    // ======================= Ref ========================
    React.useImperativeHandle(ref, () => {
      return inputRef.current!;
    });

    // ====================== Value =======================
    const [value, setValue] = useMergedState(defaultValueProp, {
      value: valueProp,
    });

    // ================== Prefix & Suffix ================== //
    const isHovering = useHover(wrapperRef);
    const prefixComp = prefix ? (
      <span
        className={cn("flex items-center", inputSizeVariants({ size }), "pr-0")}
      >
        {prefix}
      </span>
    ) : undefined;
    const clearButton = (
      <button
        type="button"
        className={cn("ml-1 flex opacity-30 hover:opacity-50")}
        onClick={() => {
          triggerNativeEventFor(document.querySelector(`[id='${id}']`), {
            event: "input",
            value: "",
          });
        }}
      >
        <Icon
          icon="icon-[ant-design--close-circle-filled]"
          className="pointer-events-none size-4"
        />
      </button>
    );
    const suffixComp =
      allowClear && value && (!suffix || (isHovering && suffix)) ? (
        clearButton
      ) : suffix ? (
        <Slot className={cn("ml-1 flex items-center")}>
          {typeof suffix === "string" ? <span>{suffix}</span> : suffix}
        </Slot>
      ) : undefined;

    // ================== Popover condition props ================== //
    const conditionWrapperProps = ariaHasPopup
      ? {
          "aria-haspopup": ariaHasPopup,
          "aria-expanded": ariaExpanded,
          "aria-controls": ariaControls,
          "data-state": dataState,
          type,
        }
      : {};
    const conditionInputProps = ariaHasPopup ? {} : { type };

    return (
      <div
        ref={wrapperRef}
        aria-hidden={hidden ? "true" : undefined}
        className={cn(
          inputVariants({ borderless, disabled, status }),
          inputSizeVariants({ size }),
          "cursor-text",
          className,
        )}
        {...conditionWrapperProps}
        onClick={(e) => {
          // e.stopPropagation();
          // TODO: triger focus
          // onInputClick https://github.com/react-component/input/blob/master/src/BaseInput.tsx
          document.querySelector<HTMLInputElement>(`[id='${id}']`)?.focus();
          onClick?.(e as React.MouseEvent<HTMLInputElement, MouseEvent>);
        }}
        {...rest}
      >
        {addonBefore && (
          <span
            className={cn(
              !borderless && "rounded-s-md",
              "border-e bg-background",
            )}
          >
            {addonBefore}
          </span>
        )}
        {prefixComp && prefixComp}
        <input
          ref={inputRef}
          id={id}
          name={name}
          value={value}
          className={cn(
            "flex-1",
            "text-left",
            "bg-transparent",
            // "placeholder:text-muted-foreground",
            "placeholder:text-placeholder",
            "border-none outline-none",
          )}
          disabled={disabled}
          onChange={(event) => {
            setValue(event.currentTarget.value);
            onChange?.(event);
          }}
          {...conditionInputProps}
        />
        {suffixComp && suffixComp}
        {addonAfter && (
          <span
            className={cn(
              !borderless && "rounded-e-md",
              "border-s bg-background",
              "whitespace-nowrap",
              // p-0 for use Select component
              React.isValidElement(addonAfter) &&
                (addonAfter.type as unknown as { displayName: string })
                  .displayName === "Select"
                ? "p-0"
                : "",
            )}
          >
            {addonAfter}
          </span>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
export type { InputProps, InputVariants };
