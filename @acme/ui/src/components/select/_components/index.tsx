import type React from "react";
import type { VariantProps } from "tailwind-variants";
import { useMemo } from "react";

import type { Select as ShadcnSelect } from "@acme/ui/shadcn/select";
import { cn } from "@acme/ui/lib/utils";
import { SelectTrigger as ShacnSelectTrigger } from "@acme/ui/shadcn/select";

import type { inputSizeVariants } from "../../input";
import type { SelectClearProps as SelectClearProperties } from "./select-clear";
import { Icon } from "../../../icons";
import { controlPaddingBySize, inputVariants } from "../../input";
import { SelectClear } from "./select-clear";

const SelectTrigger = ({
  children,
  className,

  size,
  status,
  variant,
  allowClear,
  showClearIcon,
  onClear,
  loading,
  disabled,
  suffixIcon,

  ...restProperties
}: Omit<React.ComponentProps<typeof ShacnSelectTrigger>, "size"> &
  VariantProps<typeof inputVariants> &
  VariantProps<typeof inputSizeVariants> &
  Pick<SelectClearProperties, "allowClear" | "showClearIcon"> & {
    onClear?: () => void;
    loading?: boolean;
    /* For clear */
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
      disabled={disabled}
      className={cn(
        "group relative",
        "w-full min-w-0 text-left",
        inputVariants({ variant, status, disabled }),
        // inputSizeVariants({ size }),
        "data-[size=default]:h-control data-[size=sm]:h-control-sm data-[size=lg]:h-control-lg",
        // Size-aware radius: sharper when small, softer when large.
        "data-[size=default]:rounded-md data-[size=sm]:rounded-sm data-[size=lg]:rounded-lg",
        // Shared size -> padding source, same as input/autocomplete/datepicker.
        controlPaddingBySize[size ?? "middle"],
        [
          "*:data-[slot=select-value]:block! *:data-[slot=select-value]:min-w-0 *:data-[slot=select-value]:flex-1 *:data-[slot=select-value]:truncate",
          !showClearIcon && "*:data-[slot=select-value]:h-[22px]",
        ],

        // for radix icon
        //           "flex size-5 items-center justify-center opacity-50 transition-opacity",
        [
          "[&>svg:last-of-type]:transition-opacity",
          mergedAllowClear &&
            showClearIcon &&
            "[&>svg:last-of-type]:group-hover:opacity-0",
          loading && "[&>svg:last-of-type]:hidden",
          suffixIcon && "[&>svg:last-of-type]:hidden",
        ],
        //
        className,
      )}
      {...restProperties}
    >
      {children}
      {mergedAllowClear && (
        <SelectClear
          allowClear={allowClear}
          onPointerDown={onClear}
          showClearIcon={showClearIcon}
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
            className={cn(
              "flex animate-spin items-center justify-center pl-1 opacity-50 transition-opacity",
              // Match the chevron scale it replaces; size-5 was oversized on
              // the small control.
              size === "small"
                ? "size-3.5"
                : size === "large"
                  ? "size-5"
                  : "size-4",
            )}
          />
        </span>
      )}
    </ShacnSelectTrigger>
  );
};

type SelectShadcnProperties = React.ComponentProps<typeof ShadcnSelect>;

export type { SelectShadcnProperties as SelectShadcnProps };
export { SelectTrigger };

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
  SelectValue,
} from "@acme/ui/shadcn/select";
