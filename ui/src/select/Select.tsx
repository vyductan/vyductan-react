"use client";

import React from "react";

import type { InputBaseProps } from "../input/types";
import type { SelectRootProps } from "./components";
import type { Option } from "./types";
import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValue,
} from "./components";

export const selectDefaultPlaceholder = "Select an option";

export type SelectProps<T extends string | number = string> = Omit<
  SelectRootProps,
  "value" | "onValueChange"
> & {
  value?: T;
  options: Option<T>[];

  loading?: boolean;
  empty?: React.ReactNode;
  placeholder?: string;

  onSearchChange?: (search: string) => void;

  groupClassName?: string;
  optionRender?: (option: Option<T>) => {
    checked?: boolean;
    icon?: React.ReactNode;
    label?: React.ReactNode;
  };
  optionsRender?: (options: Option<T>[]) => React.ReactNode;
} & InputBaseProps & {
    onChange?: (value: T, option: Option | Array<Option>) => void;
  };

const SelectInner = <T extends string | number = string>(
  {
    value,
    options,

    placeholder,

    onChange,
  }: SelectProps<T>,
  _: React.ForwardedRef<HTMLInputElement>,
) => {
  const [open, setOpen] = React.useState(false);

  return (
    <SelectRoot
      value={value}
      open={open}
      onOpenChange={setOpen}
      onValueChange={(value) => {
        onChange?.(
          value as T,
          options.find((x) => x.value === value) as Option,
        );
      }}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value as string}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
  );
};
export const Select = React.forwardRef(SelectInner) as <
  T extends string | number,
>(
  props: SelectProps<T> & {
    ref?: React.ForwardedRef<HTMLUListElement>;
  },
) => ReturnType<typeof SelectInner>;
