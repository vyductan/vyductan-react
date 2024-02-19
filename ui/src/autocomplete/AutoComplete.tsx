"use client";

import * as React from "react";

import { Icon } from "@vyductan/icons";

import type { CommandProps } from "../command";
import type { Option } from "../select/types";
import { Button } from "../button";
import { Command } from "../command";
import { Popover } from "../popover";

export type AutoCompleteProps<T extends string = string> = Pick<
  CommandProps<T>,
  | "value"
  | "placeholder"
  | "empty"
  | "groupClassName"
  | "optionRender"
  | "optionsRender"
> & {
  options: Option<T>[];
  trigger?: (value?: T) => React.ReactNode;

  onChange?: (value: T) => void;
  onSearchChange?: (search: string) => void;
};

const AutoCompleteInner = <T extends string>(
  {
    value,
    options,
    trigger,

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
      return placeholder ?? defaultPlaceholder;
    }
    const o = options.find((o) => o.value === value);
    if (o) {
      return (
        <>
          {props.optionRender?.icon ? (
            <span className="mr-2">{props.optionRender.icon(o)}</span>
          ) : (
            o.icon && <Icon icon={o.icon} />
          )}
          {props.optionRender?.label ? props.optionRender.label(o) : o.label}
        </>
      );
    }
    return "";
  })();

  return (
    <Popover
      trigger={
        trigger ? (
          trigger(value)
        ) : (
          <Button
            ref={buttonRef}
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between text-sm"
          >
            <span>{buttonText}</span>
            <Icon
              icon="lucide:chevrons-up-down"
              className="ml-2 size-4 shrink-0 opacity-50"
            />
          </Button>
        )
      }
      open={open}
      onOpenChange={setOpen}
      className="p-0"
      style={{ width: buttonRef.current?.offsetWidth }}
    >
      <Command<T>
        options={options.map((o) => ({
          ...o,
          onSelect: () => {
            onChange?.(o.value);
            setOpen(false);
          },
        }))}
        onSearchChange={onSearchChange}
        {...props}
      />
    </Popover>
  );
};

export const AutoComplete = React.forwardRef(AutoCompleteInner) as <
  T extends string,
>(
  props: AutoCompleteProps<T> & {
    ref?: React.ForwardedRef<HTMLUListElement>;
  },
) => ReturnType<typeof AutoCompleteInner>;

const defaultPlaceholder = "Select an option";
