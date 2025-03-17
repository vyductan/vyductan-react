"use client";

import * as React from "react";
import { useMergedState } from "rc-util";

import type { ButtonProps } from "../button";
import type { CommandProps, CommandValueType } from "../command";
// import type { ValueType } from "../form";
import type { Option } from "../select/types";
import { cn } from "..";
import { Button } from "../button";
import { Command } from "../command";
import { Icon } from "../icons";
import { inputSizeVariants } from "../input";
import { Popover } from "../popover";
import { selectColors } from "../select/colors";

export type AutocompleteProps<T extends CommandValueType = string> = Pick<
  CommandProps<T>,
  | "filter"
  | "placeholder"
  | "empty"
  | "groupClassName"
  | "optionRender"
  | "optionsRender"
  | "dropdownRender"
  | "dropdownFooter"
> & {
  value?: T;
  defaultValue?: T;
  onChange?: (value?: T, option?: Option<T>) => void;
  options: Option<T>[];
  optionsToSearch?: { value: string; label: string }[];

  className?: string;
  size?: ButtonProps["size"];
  disabled?: boolean;

  open?: boolean;

  allowClear?: boolean;

  searchPlaceholder?: string;
  onSearchChange?: (search: string) => void;
};

const Autocomplete = <T extends CommandValueType = string>({
  defaultValue: defaultValueProp,
  value: valueProp,
  options,
  optionsToSearch,

  className,
  size,
  disabled,
  open: openProp,

  filter: filterProp,

  placeholder,

  allowClear,

  onChange,

  searchPlaceholder,
  onSearchChange,

  ...props
}: AutocompleteProps<T>) => {
  /* Remove duplicate options */
  // const options = [...new Map(optionsProp.map((o) => [o.value, o])).values()];

  /* Filter Detault*/
  const filter =
    filterProp ??
    ((value, search, _) => {
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      const label = (optionsToSearch ?? options)
        .find((item) => item.value === value)
        ?.label?.toString();
      if (
        label &&
        removeTones(label.toLowerCase()).includes(
          removeTones(search.toLowerCase()),
        )
      ) {
        return 1;
      }
      return 0;
    });

  const [open, setOpen] = useMergedState(false, {
    value: openProp,
  });
  const [value, setValue] = useMergedState(defaultValueProp, {
    value: valueProp,
    onChange: (value) => {
      onChange?.(
        value,
        options.find((o) => o.value === value),
      );
      setOpen(false);
    },
  });

  const buttonText = (() => {
    if (!value) {
      return placeholder ?? <span className="opacity-0"></span>;
    }
    const o = options.find((o) => o.value === value);
    if (o) {
      const label = props.optionRender?.label
        ? props.optionRender.label(o)
        : o.label;
      return (
        <>
          {props.optionRender?.icon ? (
            <span className="mr-2">{props.optionRender.icon(o)}</span>
          ) : (
            o.icon && <Icon icon={o.icon} />
          )}
          {typeof label === "string" ? (
            <span className="line-clamp-1">{label}</span>
          ) : (
            label
          )}
        </>
      );
    }
    return <span className="line-clamp-1">{value}</span>;
  })();

  return (
    <Popover
      trigger="click"
      open={open}
      onOpenChange={setOpen}
      placement="bottomLeft"
      className={cn(
        "p-0",
        //w-(--radix-popover-trigger-width)
        // own
        "w-full min-w-(--radix-popover-trigger-width)", // make same select width
      )}
      content={
        <Command
          placeholder={searchPlaceholder}
          options={options}
          value={value}
          onChange={(value) => {
            setValue(value);
          }}
          filter={filter}
          onSearchChange={onSearchChange}
          {...props}
        />
      }
    >
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={open}
        size={size}
        disabled={disabled}
        className={cn(
          "group",
          "w-full justify-between font-normal",
          // own
          "whitespace-normal",
          !value && "text-muted-foreground",
          selectColors[options.find((o) => o.value === value)?.color ?? ""],
          "hover:" +
            selectColors[
              options.find((o) => o.value === value)?.color ?? ""
            ]?.slice(
              0,
              selectColors[
                options.find((o) => o.value === value)?.color ?? ""
              ]?.indexOf(" "),
            ),
          inputSizeVariants({ size }),
          className,
        )}
      >
        {buttonText}
        <Icon
          icon="icon-[lucide--chevrons-up-down]"
          className={cn(
            "size-4 shrink-0 opacity-50",
            !buttonText && "ml-auto",
            allowClear &&
              value &&
              "transition-opacity duration-300 group-hover:opacity-0",
          )}
        />
        {allowClear && (
          <span
            role="button"
            className={cn(
              "z-10",
              "absolute right-[13px]",
              "opacity-0 transition-opacity",
              value && "transition-opacity duration-300 group-hover:opacity-30",
              value && "hover:opacity-50",
            )}
            onClick={(e) => {
              e.preventDefault();
            }}
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onChange?.();
            }}
          >
            <Icon
              icon="icon-[ant-design--close-circle-filled]"
              className="pointer-events-none size-3.5"
            />
          </span>
        )}
      </Button>
    </Popover>
  );
};

export { Autocomplete };

export function removeTones(string_: string): string {
  return string_
    .normalize("NFD")
    .replaceAll(/[\u0300-\u036F]/g, "")
    .replaceAll("đ", "d")
    .replaceAll("Đ", "D");
}
