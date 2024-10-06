"use client";

import * as React from "react";

import { removeVietnameseTones } from "@acme/utils/remove-vietnamese-tones";

import type { CommandProps } from "../command";
import type { ValueType } from "../form";
import type { Option } from "../select/types";
import { clsm } from "..";
import { Button } from "../button";
import { Command } from "../command";
import { Icon } from "../icons";
import { Popover } from "../popover";
import { selectDefaultPlaceholder } from "../select";

export type AutoCompleteProps<T extends ValueType = string> = Pick<
  CommandProps<T>,
  | "value"
  | "filter"
  | "placeholder"
  | "empty"
  | "groupClassName"
  | "optionRender"
  | "optionsRender"
> & {
  options: Option<T>[];
  optionsToSearch?: { value: string; label: string }[];

  onChange?: (value: T) => void;
  onSearchChange?: (search: string) => void;
};

const AutoCompleteInner = <T extends ValueType = string>(
  {
    value,
    options,
    optionsToSearch,

    filter = (value, search, _) => {
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
    },

    placeholder,

    onChange,
    onSearchChange,
    ...props
  }: AutoCompleteProps<T>,
  _: React.ForwardedRef<HTMLInputElement>,
) => {
  const [open, setOpen] = React.useState(false);

  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const buttonText = (() => {
    if (!value) {
      return placeholder ?? selectDefaultPlaceholder;
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
      className="p-0"
      style={{ width: buttonRef.current?.offsetWidth }}
      content={
        <Command
          value={value}
          options={options.map((o) => ({
            ...o,
            onSelect: () => {
              onChange?.(o.value);
              setOpen(false);
            },
          }))}
          onSearchChange={onSearchChange}
          filter={filter}
          {...props}
        />
      }
    >
      <Button
        ref={buttonRef}
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className={clsm(
          "w-full justify-between text-sm font-normal",
          !value && "text-muted-foreground",
        )}
      >
        {buttonText}
        <Icon
          icon="icon-[lucide--chevrons-up-down]"
          className="ml-2 size-4 shrink-0 opacity-50"
        />
      </Button>
    </Popover>
  );
};

export const Autocomplete = React.forwardRef(AutoCompleteInner) as <
  T extends ValueType,
>(
  props: AutoCompleteProps<T> & {
    ref?: React.ForwardedRef<HTMLUListElement>;
  },
) => ReturnType<typeof AutoCompleteInner>;
