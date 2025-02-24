"use client";

import * as React from "react";
import { useMergedState } from "rc-util";

import { removeVietnameseTones } from "@acme/utils/remove-vietnamese-tones";

import type { ButtonProps } from "../button";
import type { CommandProps } from "../command";
import type { ValueType } from "../form";
import type { Option } from "../select/types";
import { cn } from "..";
import { Button } from "../button";
import { Command } from "../command";
import { Icon } from "../icons";
import { Popover } from "../popover";
import { selectColors } from "../select/colors";

export type AutocompleteProps<T extends ValueType = string> = Pick<
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

  allowClear?: boolean;

  searchPlaceholder?: string;
  onSearchChange?: (search: string) => void;
};

const Autocomplete = <T extends ValueType = string>({
  defaultValue: defaultValueProp,
  value: valueProp,
  options: optionsProp,
  optionsToSearch,

  className,
  size,
  disabled,

  filter: filterProp,

  placeholder,

  allowClear,

  onChange,

  searchPlaceholder,
  onSearchChange,

  ...props
}: AutocompleteProps<T>) => {
  /* Remove duplicate options */
  const options = [...new Map(optionsProp.map((o) => [o.value, o])).values()];

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
        removeVietnameseTones(label.toLowerCase()).includes(
          removeVietnameseTones(search.toLowerCase()),
        )
      ) {
        return 1;
      }
      return 0;
    });

  const [open, setOpen] = React.useState(false);
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
            <span className="truncate">{label}</span>
          ) : (
            label
          )}
        </>
      );
    }
    return "";
  })();

  return (
    <Popover
      trigger="click"
      open={open}
      onOpenChange={setOpen}
      className="w-(--radix-popover-trigger-width) p-0"
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
          "w-full justify-between text-sm font-normal",
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
          className,
        )}
      >
        {buttonText}
        <Icon
          icon="icon-[lucide--chevrons-up-down]"
          className="ml-2 size-4 shrink-0 opacity-50"
        />
        {allowClear && (
          <button
            className={cn(
              "z-10",
              "absolute right-[11px]",
              "flex size-5 items-center justify-center transition-opacity",
              "opacity-0",
              "hover:opacity-50!",
              value && "group-hover:opacity-30",
            )}
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // onClear();
              onChange?.();
              // setOpen(false);
            }}
          >
            <Icon
              icon="icon-[ant-design--close-circle-filled]"
              className="pointer-events-none size-3.5"
            />
          </button>
        )}
      </Button>
    </Popover>
  );
};

export { Autocomplete };
