"use client";

import type { VariantProps } from "class-variance-authority";
import React from "react";

import type { ValueType } from "../form";
import type { inputSizeVariants, inputVariants } from "../input";
import type { SelectRootProps } from "./_components";
import type { Option } from "./types";
import { cn } from "..";
import { Empty } from "../empty";
import { tagColors } from "../tag";
import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValue,
} from "./_components";

export type SelectProps<T extends ValueType = string> = Omit<
  SelectRootProps,
  "value" | "onValueChange"
> &
  VariantProps<typeof inputVariants> &
  VariantProps<typeof inputSizeVariants> & {
    // ref?: React.ForwardedRef<HTMLUListElement>;

    id?: string;
    value?: T;
    options: Option<T>[];
    placeholder?: string;

    allowClear?: boolean;
    loading?: boolean;

    className?: string;
    empty?: React.ReactNode;
    dropdownRender?: (originalNode: React.ReactNode) => React.ReactNode;
    optionRender?: (option: Option<T>) => {
      checked?: boolean;
      icon?: React.ReactNode;
      label?: React.ReactNode;
    };
    optionsRender?: (options: Option<T>[]) => React.ReactNode;
    onSearchChange?: (search: string) => void;
    onChange?: (value?: T, option?: Option | Array<Option>) => void;
  };

const Select = <T extends ValueType = string>({
  id,
  value,
  options: optionsProp,
  placeholder,

  allowClear,
  loading,

  className,
  borderless,
  size,
  status,
  dropdownRender,

  onChange,
  ...props
}: SelectProps<T>) => {
  /* Remove duplicate options */
  const options = [...new Map(optionsProp.map((o) => [o.value, o])).values()];

  const [open, setOpen] = React.useState(false);

  // fix placeholder did not back when set value to undefined
  // https://github.com/radix-ui/primitives/issues/1569#issuecomment-1434801848
  // https://github.com/radix-ui/primitives/issues/1569#issuecomment-2166384619
  const [key, setKey] = React.useState<number>(+Date.now());

  const content = (
    <>
      {/* to allow user set value that not in options */}
      {!!value && !options.some((o) => o.value === value) && value !== "" && (
        <SelectItem value={value as string}>{value}</SelectItem>
      )}
      {options.length > 0 ? (
        options.map((o) => (
          <SelectItem
            key={String(o.value)}
            value={o.value as string}
            className={cn(
              o.color ? tagColors[o.color] : "",
              o.color ? "hover:bg-current/10" : "",
            )}
          >
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
      key={key}
      value={value as string}
      open={open}
      onOpenChange={setOpen}
      onValueChange={(changedValue) => {
        const o = options.find((x) => String(x.value) === String(changedValue));
        // to allow user set value that not in options
        if (!changedValue || !o) return;
        onChange?.(o.value, o as Option);
      }}
      {...props}
    >
      <SelectTrigger
        id={id}
        className={cn(
          "w-full",
          tagColors[options.find((o) => o.value === value)?.color ?? ""],
          className,
        )}
        loading={loading}
        borderless={borderless}
        size={size}
        status={status}
        allowClear={allowClear}
        onClear={() => {
          onChange?.();
          setKey(+Date.now());
        }}
        value={value}
      >
        <SelectValue placeholder={placeholder} className="h-5" />
      </SelectTrigger>
      <SelectContent
        // className={options.some((o) => o.color) ? "space-y-2" : ""}
        classNames={{
          viewport: options.some((o) => o.color) ? "space-y-2" : "",
        }}
      >
        {ContentComp}
      </SelectContent>
    </SelectRoot>
  );
};

export { Select };
