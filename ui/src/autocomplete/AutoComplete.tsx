"use client";

import * as React from "react";

import { Icon } from "@vyductan/icons";

import type { CommandProps } from "../command";
import type { InputBaseProps } from "../input/types";
import type { SelectOption } from "../select/types";
import { Button } from "../button";
import { Command } from "../command";
import { Popover } from "../popover";

export type AutocompleteProps = Pick<
  CommandProps,
  "value" | "placeholder" | "empty"
> &
  InputBaseProps & {
    options: SelectOption[];
    onChange?: (value: InputBaseProps["value"]) => void;
  };
export const AutoComplete = React.forwardRef<
  HTMLInputElement,
  AutocompleteProps
>(
  (
    {
      value,
      options,
      onChange,

      placeholder,
      ...props
    },
    _,
  ) => {
    const [open, setOpen] = React.useState(false);

    const buttonRef = React.useRef<HTMLButtonElement>(null);

    return (
      <Popover
        trigger={
          <Button
            ref={buttonRef}
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {value
              ? options.find((o) => o.value === value)?.label
              : placeholder ?? defaultPlaceholder}
            <Icon
              icon="lucide:chevrons-up-down"
              className="ml-2 size-4 shrink-0 opacity-50"
            />
          </Button>
        }
        open={open}
        onOpenChange={setOpen}
        className="p-0"
        style={{ width: buttonRef.current?.offsetWidth }}
      >
        <Command
          options={options.map((o) => ({
            ...o,
            onSelect: () => {
              onChange?.(o.value);
              setOpen(false);
            },
          }))}
          {...props}
        />
      </Popover>
    );
  },
);
AutoComplete.displayName = "AutoComplete";

const defaultPlaceholder = "Select an option";
