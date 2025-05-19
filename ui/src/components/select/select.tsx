"use client";

import type { VariantProps } from "class-variance-authority";
import React from "react";

import { Tag, tagColors } from "@acme/ui/components/tag";
import { cn } from "@acme/ui/lib/utils";

import type { AnyObject } from "../..";
import type { SelectRootProps } from "../../shadcn/select";
import type { ValueType } from "../form";
import type { inputSizeVariants, InputVariants } from "../input";
import type { Option } from "./types";
import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValue,
} from "../../shadcn/select";
import { Empty } from "../empty";

export type SelectMode = "default" | "multiple" | "tags";

type SelectDefaultProps<
  TValue extends ValueType = string,
  TRecord extends AnyObject = AnyObject,
> = {
  mode?: "default";
  value?: TValue;
  onChange?: (value?: TValue, option?: Option<TValue, TRecord>) => void;
};
// type SelectMultipleProps<
//   TValue extends ValueType = string,
//   TRecord extends AnyObject = AnyObject,
// > = {
//   mode: "multiple";
//   value?: Array<TValue>;
//   onChange?: (
//     value?: Array<TValue>,
//     option?: Array<Option<TValue, TRecord>>,
//   ) => void;
// };

type SelectMultipleOrTagsProps<
  TValue extends ValueType = string,
  TRecord extends AnyObject = AnyObject,
> = {
  mode: "multiple" | "tags";
  value?: Array<TValue>;
  onChange?: (
    value?: Array<TValue>,
    option?: Array<Option<TValue, TRecord>>,
  ) => void;
};

export type SelectProps<
  TValue extends ValueType = string,
  TRecord extends AnyObject = AnyObject,
> = Pick<SelectRootProps, "children" | "onValueChange"> &
  (
    | SelectDefaultProps<TValue, TRecord>
    | SelectMultipleOrTagsProps<TValue, TRecord>
  ) &
  InputVariants &
  VariantProps<typeof inputSizeVariants> & {
    id?: string;
    // value?: TValue;
    options?: Option<TValue, TRecord>[];
    placeholder?: string;

    allowClear?: boolean;
    loading?: boolean;

    className?: string;
    empty?: React.ReactNode;
    dropdownRender?: (originalNode: React.ReactNode) => React.ReactNode;
    optionRender?: (option: Option<TValue, TRecord>) => {
      checked?: boolean;
      icon?: React.ReactNode;
      label?: React.ReactNode;
    };
    optionsRender?: (options: Option<TValue, TRecord>[]) => React.ReactNode;
    onSearchChange?: (search: string) => void;
    // onChange?: (
    //   value?: TValue,
    //   option?: TValue extends Array<any>
    //     ? Array<Option<TValue, TRecord>>
    //     : Option<TValue, TRecord>,
    // ) => void;
    // mode?: SelectMode;
  };

const Select = <
  TValue extends ValueType = string,
  TRecord extends AnyObject = AnyObject,
>(
  props: SelectProps<TValue, TRecord>,
) => {
  const {
    id,
    options = [],
    placeholder,

    allowClear,
    loading,

    className,
    variant,
    size,
    status,
    dropdownRender,
    // optionRender,
    // optionsRender,

    mode, // NOTE: do not set default (for typescript work)
    value,
    onChange,
    ...restProps
  } = props;
  // const { mode, value, onChange } = props;

  // if (mode === "default") {
  //   value;
  //   onChange;
  // }

  const [open, setOpen] = React.useState(false);

  // fix placeholder did not back when set value to undefined
  // https://github.com/radix-ui/primitives/issues/1569#issuecomment-1434801848
  // https://github.com/radix-ui/primitives/issues/1569#issuecomment-2166384619
  const [key, setKey] = React.useState<number>(+Date.now());

  // ======================= TAGS/MULTIPLE MODE =======================
  const isDefault = !mode || mode === "default";
  const isTags = mode === "tags";
  const isMultiple = mode === "multiple" || isTags;
  const [inputValue, setInputValue] = React.useState("");

  // Normalize value for multi/tags mode
  const selectedValues: TValue[] = isMultiple
    ? (value ?? [])
    : Array.isArray(value)
      ? value
      : value
        ? [value]
        : [];
  // const selectedValues: TValue[] = mode==="default" ?value ? [value] : [] : value ?? []

  // Add custom tag in tags mode
  const addTag = (tag: TValue) => {
    if (isMultiple) {
      if (!tag || selectedValues.includes(tag)) return;
      const newValues = [...selectedValues, tag];
      onChange?.(newValues);
      setInputValue("");
    }
  };

  // Remove tag
  const removeTag = (tag: TValue) => {
    if (isMultiple) {
      const newValues = selectedValues.filter((v) => v !== tag);
      onChange?.(newValues);
    }
  };

  // Handle select item
  const handleSelect = (val: TValue) => {
    if (isMultiple) {
      if (selectedValues.includes(val)) {
        removeTag(val);
      } else {
        addTag(val);
      }
    }
    if (isDefault) {
      onChange?.(
        val,
        options.find((o) => o.value === val),
      );
    }
  };

  // Handle input in tags mode
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const tag = inputValue.trim();
      if (tag) addTag(tag as TValue);
    } else if (
      e.key === "Backspace" &&
      !inputValue &&
      selectedValues.length > 0
    ) {
      removeTag(selectedValues.at(-1)!);
    }
  };

  const isShadcnSelect = !props.options;
  if (isShadcnSelect) return <SelectRoot {...restProps} />;

  // Content for dropdown
  const content = (
    <>
      {isTags && inputValue && !options.some((o) => o.value === inputValue) && (
        <SelectItem
          value={inputValue}
          onSelect={() => addTag(inputValue as TValue)}
          className="text-primary font-semibold"
        >
          Add "{inputValue}"
        </SelectItem>
      )}
      {options.length > 0 ? (
        options.map((o) => (
          <SelectItem
            key={String(o.value)}
            value={o.value as string}
            className={
              selectedValues.includes(o.value)
                ? "bg-accent text-accent-foreground"
                : ""
            }
            onMouseDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleSelect(o.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                handleSelect(o.value);
              }
            }}
            // onKeyDown={(e) => {
            //   e.stopPropagation();
            //   e.preventDefault();
            //   handleSelect(o.value);
            // }}
            isActive={selectedValues.includes(o.value)}
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
      value={isMultiple ? undefined : (value as string)}
      open={open}
      onOpenChange={setOpen}
      // onValueChange={(changedValue) => {
      //   console.log("vvvvvv", changedValue);
      //   const o = options.find((x) => String(x.value) === String(changedValue));
      //   // to allow user set value that not in options
      //   if (!changedValue || !o) return;
      //   if (isMultiple) {
      //     const newValue = value?.some((v) => v === changedValue)
      //       ? value.filter((v) => v !== changedValue)
      //       : ([...(value ?? []), changedValue] as TValue[]);
      //     console.log(
      //       "nnnnnn",
      //       value,
      //       changedValue,
      //       newValue,
      //       value?.filter((v) => v !== changedValue),
      //     );
      //     onChange?.(
      //       newValue,
      //       options.filter((o) => o.value === changedValue),
      //     );
      //   } else if (isDefault) {
      //     onChange?.(o.value, o);
      //   }
      // }}
      {...restProps}
    >
      <SelectTrigger
        id={id}
        // value={value}
        loading={loading}
        className={cn(
          "w-full",
          isMultiple && "pl-[3px]",
          tagColors[options.find((o) => o.value === value)?.color ?? ""],
          className,
        )}
        variant={variant}
        size={size}
        status={status}
        allowClear={allowClear}
        onClear={() => {
          if (isMultiple) {
            onChange?.([] as TValue[]);
          }
          if (isDefault) {
            onChange?.();
          }
          setKey(+Date.now());
        }}
        {...restProps} // for form-control
      >
        {isMultiple ? (
          <div className="flex flex-wrap">
            {selectedValues.map((tag, index) => (
              <Tag
                key={index}
                className="mr-1 py-0 leading-[22px]"
                closeable
                onClose={() => removeTag(tag)}
              >
                {tag}
              </Tag>
            ))}
            {isTags && (
              <input
                className="m-0 min-w-[40px] border-none bg-transparent p-0 text-xs outline-none"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder={selectedValues.length === 0 ? placeholder : ""}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(true);
                }}
              />
            )}
          </div>
        ) : (
          <SelectValue placeholder={placeholder} className="h-5" />
        )}
      </SelectTrigger>
      <SelectContent
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
