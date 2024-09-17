"use client";

import type { VariantProps } from "class-variance-authority";
import React from "react";

import type { ValueType } from "../form";
import type { inputSizeVariants, inputVariants } from "../input";
import type { SelectRootProps } from "./_components";
import type { Option } from "./types";
import { clsm } from "..";
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
    id?: string;
    value?: T;
    options: Option<T>[];
    placeholder?: string;

    className?: string;
    groupClassName?: string;
    loading?: boolean;
    empty?: React.ReactNode;
    dropdownRender?: (originalNode: React.ReactNode) => React.ReactNode;
    optionRender?: (option: Option<T>) => {
      checked?: boolean;
      icon?: React.ReactNode;
      label?: React.ReactNode;
    };
    optionsRender?: (options: Option<T>[]) => React.ReactNode;
    onSearchChange?: (search: string) => void;
    onChange?: (value: T, option: Option | Array<Option>) => void;
  };

const SelectInner = <T extends ValueType = string>(
  {
    id,
    value,
    options,
    placeholder,

    className,
    borderless,
    size,
    status,
    dropdownRender,

    onChange,
    ...props
  }: SelectProps<T>,
  _: React.ForwardedRef<HTMLInputElement>,
) => {
  const [open, setOpen] = React.useState(false);

  const content = (
    <>
      {options.length > 0 ? (
        options.map((o) => (
          <SelectItem key={String(o.value)} value={o.value as string}>
            {o.label}
          </SelectItem>
        ))
      ) : (
        <Empty />
      )}
    </>
  );
  const ContentComp = dropdownRender ? dropdownRender(content) : content;
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
        id={id}
        className={clsm("w-full", className)}
        borderless={borderless}
        size={size}
        status={status}
      >
        <SelectValue placeholder={placeholder} className="h-5" />
      </SelectTrigger>
      <SelectContent>{ContentComp}</SelectContent>
    </SelectRoot>
  );
};

export const Select = React.forwardRef(SelectInner) as <T extends ValueType>(
  props: SelectProps<T> & {
    ref?: React.ForwardedRef<HTMLUListElement>;
  },
) => ReturnType<typeof SelectInner>;
