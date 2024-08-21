"use client";

import type { VariantProps } from "class-variance-authority";
import * as React from "react";
import { useHover } from "ahooks";
import { cva } from "class-variance-authority";
import { useMergedState } from "rc-util";

import { clsm } from "..";
import { triggerNativeEventFor } from "../_util/event";
import { Icon } from "../icons";

export const inputVariants = cva(
  [
    "w-full",
    "flex border border-input ring-offset-background",
    "text-sm",
    "focus-within:outline-none",
    // "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-background-active disabled:hover:border-input",
    // "file:border-0 file:bg-transparent file:text-sm file:font-medium",
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
      status: {
        default: [
          "hover:border-primary-500",
          "focus-within:!border-primary-600 focus-within:ring-primary-100",
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
      default: "px-[11px] py-[5px]",
      lg: "px-[11px] py-[9px]",
    },
  },
  defaultVariants: {
    size: "default",
  },
});
type InputVariants = Omit<VariantProps<typeof inputVariants>, "disabled"> & {
  disabled?: boolean;
};
type InputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size" | "prefix"
> &
  InputVariants &
  /** If allow to remove input content with clear icon */
  VariantProps<typeof inputSizeVariants> & {
    allowClear?: boolean | { clearIcon: React.ReactNode };
    prefix?: React.ReactNode;
    suffix?: React.ReactNode;
    addonBefore?: React.ReactNode;
    addonAfter?: React.ReactNode;
  };
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      borderless,
      className,
      disabled,
      hidden,
      size,
      status,

      allowClear,
      addonBefore,
      addonAfter,
      prefix,
      suffix,

      id: idProp,
      onChange,
      ...props
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
    const [value, setValue] = useMergedState(props.defaultValue, {
      value: props.value,
    });

    // ================== Prefix & Suffix ================== //
    const isHovering = useHover(wrapperRef);
    const prefixComp = prefix ? (
      <span
        className={clsm(
          "flex items-center",
          inputSizeVariants({ size }),
          "pr-0",
        )}
      >
        {prefix}
      </span>
    ) : null;
    const suffixComp = suffix ? (
      allowClear && isHovering && value ? (
        <button
          type="button"
          className={clsm(
            "flex opacity-30 hover:opacity-50",
            inputSizeVariants({ size }),
          )}
          onClick={() => {
            triggerNativeEventFor(document.getElementById(id), {
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
      ) : (
        <span
          className={clsm(
            "flex items-center",
            inputSizeVariants({ size }),
            "pl-0",
          )}
        >
          {suffix}
        </span>
      )
    ) : null;

    return (
      <span
        ref={wrapperRef}
        aria-hidden={hidden ? "true" : undefined}
        className={clsm(
          inputVariants({ borderless, disabled, status }),
          "cursor-text",
          className,
        )}
        onClick={() => {
          document.getElementById(id)?.focus();
        }}
      >
        {addonBefore && (
          <span
            className={clsm(
              !borderless && "rounded-s-md",
              "border-e bg-background",
              inputSizeVariants({ size }),
            )}
          >
            {addonBefore}
          </span>
        )}
        {prefixComp && prefixComp}
        <input
          id={id}
          ref={inputRef}
          className={clsm(
            "w-full",
            "bg-transparent",
            "placeholder:text-muted-foreground",
            "border-none outline-none",
            inputSizeVariants({ size }),
          )}
          disabled={disabled}
          onChange={(e) => {
            setValue(e.currentTarget.value);
            onChange?.(e);
          }}
          {...props}
        />
        {suffixComp && suffixComp}
        {addonAfter && (
          <span
            className={clsm(
              !borderless && "rounded-e-md",
              "border-s bg-background",
              inputSizeVariants({ size }),
            )}
          >
            {addonAfter}
          </span>
        )}
      </span>
    );
  },
);
Input.displayName = "Input";

export { Input };
export type { InputProps, InputVariants };
