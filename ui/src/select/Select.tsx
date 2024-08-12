"use client";

import type { VariantProps } from "class-variance-authority";
import React from "react";

import type { ValueType } from "../form";
import type { inputSizeVariants, inputVariants } from "../input";
import type { SelectRootProps } from "./_components";
import type { Option } from "./types";
import { Empty } from "../empty";
import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValue,
} from "./_components";

export const selectDefaultPlaceholder = "Select an option";

export type SelectProps<T extends ValueType = string> = Omit<
  SelectRootProps,
  "value" | "onValueChange"
> &
  VariantProps<typeof inputVariants> &
  VariantProps<typeof inputSizeVariants> & {
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
    onChange?: (value: T, option: Option | Array<Option>) => void;
  };

const SelectInner = <T extends ValueType = string>(
  {
    value,
    options,

    placeholder,

    onChange,

    borderless,
    size,
    status,

    ...props
  }: SelectProps<T>,
  _: React.ForwardedRef<HTMLInputElement>,
) => {
  const [open, setOpen] = React.useState(false);

  return (
    <SelectRoot
      value={value as string}
      open={open}
      onOpenChange={setOpen}
      onValueChange={(value) => {
        const x = options.find((x) => String(x.value) === String(value))?.value;
        onChange?.(x!, options.find((x) => x.value === value) as Option);
      }}
      {...props}
    >
      <SelectTrigger
        className="w-full"
        borderless={borderless}
        size={size}
        status={status}
      >
        <SelectValue placeholder={placeholder} className="h-5" />
      </SelectTrigger>
      <SelectContent>
        {options.length > 0 ? (
          options.map((o) => (
            <SelectItem key={String(o.value)} value={o.value as string}>
              {o.label}
            </SelectItem>
          ))
        ) : (
          <Empty />
        )}
      </SelectContent>
    </SelectRoot>
  );
};

export const Select = React.forwardRef(SelectInner) as <T extends ValueType>(
  props: SelectProps<T> & {
    ref?: React.ForwardedRef<HTMLUListElement>;
  },
) => ReturnType<typeof SelectInner>;
