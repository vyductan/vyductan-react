import type { VariantProps } from "tailwind-variants";
import React, { useMemo } from "react";
import { cn } from "@/lib/utils";

import { SelectTrigger as ShacnSelectTrigger } from "@acme/ui/shadcn/select";

import type { ValueType } from "../../form";
import type { inputSizeVariants } from "../../input";
import type { SelectClearProps } from "./select-clear";
import { Icon } from "../../../icons";
import { inputVariants } from "../../input";
import { SelectClear } from "./select-clear";

const SelectTrigger = ({
  value,

  children,
  className,

  size,
  status,
  variant,
  allowClear,
  clearIcon,
  onClear,
  loading,
  disabled,
  suffixIcon,

  ...restProps
}: Omit<React.ComponentProps<typeof ShacnSelectTrigger>, "size"> &
  VariantProps<typeof inputVariants> &
  VariantProps<typeof inputSizeVariants> &
  Pick<SelectClearProps, "allowClear" | "clearIcon"> & {
    onClear?: () => void;
    loading?: boolean;
    /* For clear */
    value?: ValueType | undefined;
    suffixIcon?: React.ReactNode;
  }) => {
  const mergedAllowClear = useMemo<boolean>(() => {
    if (!disabled && !!allowClear) {
      return true;
    }
    return false;
  }, [allowClear, disabled]);

  const mergedSize =
    size === "small" ? "sm" : size === "large" ? "lg" : "default";
  return (
    <ShacnSelectTrigger
      data-size={mergedSize}
      className={cn(
        "group relative",
        "w-full",
        inputVariants({ variant, status }),
        // inputSizeVariants({ size }),
        // controlHeightVariants({ size }),
        "data-[size=default]:h-control data-[size=sm]:h-control-sm data-[size=lg]:h-control-lg",
        [
          "*:data-[slot=select-value]:truncate",
          !value && "*:data-[slot=select-value]:h-[22px]",
        ],

        // for radix icon
        //           "flex size-5 items-center justify-center opacity-50 transition-opacity",
        [
          "[&>svg:last-of-type]:transition-opacity",
          mergedAllowClear &&
            value &&
            "[&>svg:last-of-type]:group-hover:opacity-0",
          loading && "[&>svg:last-of-type]:hidden",
          suffixIcon && "[&>svg:last-of-type]:hidden",
        ],
        //
        className,
      )}
      {...restProps}
    >
      {children}
      {mergedAllowClear && (
        <SelectClear
          clearIcon={clearIcon}
          onPointerDown={onClear}
          value={value}
        />
      )}

      {suffixIcon && (
        <span className="flex size-5 items-center justify-center pl-1 opacity-50 transition-opacity">
          {suffixIcon}
        </span>
      )}

      {loading && (
        <span className="flex items-center">
          <Icon
            icon="icon-[lucide--loader]"
            className="flex size-5 animate-spin items-center justify-center pl-1 opacity-50 transition-opacity"
          />
        </span>
      )}
    </ShacnSelectTrigger>
  );
};

export { SelectTrigger };

export {
  SelectRoot,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
  SelectValue,
} from "@acme/ui/shadcn/select";
