import type { VariantProps } from "class-variance-authority";
import * as React from "react";
import { useHover } from "ahooks";
import { cva } from "class-variance-authority";
import { useMergedState } from "rc-util";

import { clsm } from "@acme/ui";

import { triggerNativeEventFor } from "../_util/event";
import { Icon } from "../icons";

export const inputStatusVariants = cva(
  [
    "w-full",
    "flex rounded-md border border-input ring-offset-background",
    "text-sm",
    "focus-within:outline-none",
    "disabled:cursor-not-allowed disabled:opacity-50",
    // "file:border-0 file:bg-transparent file:text-sm file:font-medium",
  ],
  {
    variants: {
      borderless: {
        true: ["border-0", "focus-within:outline-none"],
        false: ["border", "rounded-md", "focus-within:ring-2"],
      },
      size: {
        sm: "",
        default: "px-[11px] py-[5px]",
        lg: "px-[11px] py-[9px]",
      },
      status: {
        default: [
          "hover:border-primary-500",
          "focus-within:!border-primary-600 focus-within:ring-primary-100",
        ],
      },
    },
    defaultVariants: {
      borderless: false,
      size: "default",
      status: "default",
    },
  },
);
type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> &
  VariantProps<typeof inputStatusVariants> & {
    /** If allow to remove input content with clear icon */
    allowClear?: boolean | { clearIcon: React.ReactNode };
    suffix?: React.ReactNode;
  };
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      allowClear,
      borderless,
      className,
      id: idProp,
      size,
      status,
      suffix,
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
    const suffixComp = suffix ? (
      allowClear && isHovering && value ? (
        <button
          type="button"
          className="opacity-30 hover:opacity-50"
          onClick={() => {
            triggerNativeEventFor(document.getElementById(id), {
              event: "input",
              value: "",
            });
          }}
        >
          <Icon
            icon="ant-design:close-circle-filled"
            type="button"
            className="pointer-events-none size-4"
          />
        </button>
      ) : (
        suffix
      )
    ) : null;

    return (
      <span
        ref={wrapperRef}
        className={clsm(
          inputStatusVariants({ borderless, size, status }),
          "cursor-text",
          className,
        )}
        aria-hidden="true"
        onClick={() => {
          document.getElementById(id)?.focus();
        }}
      >
        <input
          id={id}
          className={clsm(
            "w-full",
            "bg-transparent",
            "placeholder:text-muted-foreground",
            "border-none outline-none",
          )}
          ref={inputRef}
          onChange={(e) => {
            setValue(e.currentTarget.value);
            onChange?.(e);
          }}
          {...props}
        />
        {suffixComp && <span className="flex items-center">{suffixComp}</span>}
      </span>
    );
  },
);
Input.displayName = "Input";

export { Input };
export type { InputProps };
