"use client";

import type { VariantProps } from "class-variance-authority";
import React from "react";
import { tagColors } from "@acme/ui/components/tag";
import useControlledState from "@rc-component/util/lib/hooks/useControlledState";

import { cn } from "@acme/ui/lib/utils";

import type { AnyObject } from "../_util/type";
import type { inputSizeVariants, InputVariants } from "../input";
import type { SelectShadcnProps } from "./_components";
import type { FlattenOptionData, OptionType, SelectValueType } from "./types";
import { SelectContent, SelectItem, SelectRoot } from "@acme/ui/shadcn/select";
import { Empty } from "../empty";
import { SelectTrigger, SelectValue } from "./_components";
import { SelectMultipleContent } from "./_components/select-multiple-content";
import { SelectContext } from "./context";

type SemanticName = "root";
type PopupSemantic = "root";

type SelectDefaultProps<
  TValue extends SelectValueType = SelectValueType,
  TRecord extends AnyObject = AnyObject,
> = {
  mode?: never;

  defaultValue?: TValue;
  value?: TValue;
  onChange?: (value: TValue, option?: OptionType<TValue, TRecord>) => void;
};

type SelectMultipleOrTagsProps<
  TValue extends SelectValueType = SelectValueType,
  TRecord extends AnyObject = AnyObject,
> = {
  mode: "multiple" | "tags";

  defaultValue?: TValue[];
  value?: TValue;
  onChange?: (value: TValue[], option?: OptionType<TValue, TRecord>[]) => void;
};

type SelectProps<
  TValue extends SelectValueType = SelectValueType,
  TRecord extends AnyObject = AnyObject,
> = (
  | SelectDefaultProps<TValue, OptionType<TValue, TRecord>>
  | SelectMultipleOrTagsProps<TValue, OptionType<TValue, TRecord>>
) &
  Pick<SelectShadcnProps, "open" | "onOpenChange"> &
  InputVariants &
  VariantProps<typeof inputSizeVariants> & {
    id?: string;
    options?: OptionType<TValue, TRecord>[];
    placeholder?: string;
    allowClear?: boolean;

    maxCount?: number;
    loading?: boolean;
    suffixIcon?: React.ReactNode;

    style?: React.CSSProperties;
    className?: string;
    styles?: Partial<Record<SemanticName, React.CSSProperties>> & {
      popup?: Partial<Record<PopupSemantic, React.CSSProperties>>;
    };
    classNames?: Partial<Record<SemanticName, string>> & {
      popup?: Partial<Record<PopupSemantic, string>>;
    };
    empty?: React.ReactNode;
    dropdownRender?: (originalNode: React.ReactNode) => React.ReactNode;
    optionRender?: (
      oriOption: FlattenOptionData<OptionType<TValue, TRecord>>,
      info: {
        index: number;
      },
    ) => React.ReactNode;
    onSearchChange?: (search: string) => void;

    // Base
    showSearch?: boolean;
    children?: React.ReactNode;
  };

const Select = <
  TValue extends SelectValueType = SelectValueType,
  TRecord extends AnyObject = AnyObject,
>(
  props: SelectProps<TValue, TRecord>,
) => {
  const { open, onOpenChange } = props;

  // fix placeholder did not back when set value to undefined
  // https://github.com/radix-ui/primitives/issues/1569#issuecomment-1434801848
  // https://github.com/radix-ui/primitives/issues/1569#issuecomment-2166384619
  const [key, setKey] = React.useState<number>(() => +Date.now());

  // ======================= CUSTOM SELECT =======================

  const {
    id,
    options = [],
    placeholder,

    allowClear,
    disabled,
    loading,

    className,
    variant,
    size,
    status,
    dropdownRender,
    optionRender,
    // optionsRender,

    mode, // NOTE: do not set default (for typescript work)
    defaultValue,
    value,
    onChange,
    children,
    ...triggerProps
  } = props;

  // ======================= TAGS/MULTIPLE MODE =======================
  const isDefault = !mode;
  const isTags = mode === "tags";
  const isMultiple = mode === "multiple" || isTags;

  const [internalOpen, setInternalOpen] = useControlledState(open);
  const handleOpenChange = (open: boolean) => {
    setInternalOpen(open);
    onOpenChange?.(open);
  };

  // =========================== Values ===========================
  const [internalValue, setInternalValue] = useControlledState(
    defaultValue,
    value,
  );
  const selectedValues =
    internalValue === undefined
      ? []
      : isMultiple && Array.isArray(internalValue)
        ? internalValue
        : isDefault && !Array.isArray(internalValue)
          ? [internalValue]
          : [];

  const triggerChange = (value?: TValue) => {
    if (value === undefined) {
      setInternalValue(undefined);
      return;
    } else if (isDefault) {
      // const newValue = [value];
      setInternalValue(value);
      const returnOption = options.find((o) => value === o.value);
      onChange?.(value, returnOption);
    } else if (isMultiple) {
      // if(selectedValues.includes(value)){
      //   return;
      // }
      const newValue = selectedValues.includes(value)
        ? selectedValues.filter((v) => v !== value)
        : [...selectedValues, value];
      setInternalValue(newValue);
      const returnOptions = options.filter((o) => newValue.includes(o.value));
      onChange?.(newValue, returnOptions);
    }
  };

  // Content for dropdown
  const content = (
    <>
      {children ??
        (options.length > 0 ? (
          options.map((o, oIndex) => {
            const optionContent = optionRender
              ? optionRender(
                  {
                    label: o.label,
                    data: o,
                    key: String(o.value),
                    value: o.value,
                  },
                  { index: oIndex },
                )
              : o.label;

            return (
              <SelectItem
                key={String(o.value)}
                value={o.value as string}
                className={cn(
                  selectedValues.includes(o.value)
                    ? "bg-primary-100 focus:bg-primary-100 hover:bg-primary-100 [&>span>span[role='img']]:text-primary-600"
                    : "",
                  o.color && tagColors[o.color],
                )}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  triggerChange(o.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    triggerChange(o.value);
                  }
                }}
                isActive={selectedValues.includes(o.value)}
              >
                {optionContent}
              </SelectItem>
            );
          })
        ) : (
          <Empty />
        ))}
    </>
  );
  const ContentComp = dropdownRender ? dropdownRender(content) : content;

  return (
    <SelectContext.Provider
      value={{
        selectedValues,
        triggerChange: triggerChange as (value?: SelectValueType) => void,
      }}
    >
      <SelectRoot
        key={key}
        defaultValue={
          isDefault ? (defaultValue as string | undefined) : undefined
        }
        value={
          isDefault
            ? (selectedValues[0] as string | undefined)
            : isMultiple
              ? undefined
              : undefined
        }
        open={internalOpen}
        onOpenChange={handleOpenChange}
      >
        <SelectTrigger
          id={id}
          loading={loading}
          disabled={disabled}
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
          showClearIcon={selectedValues.length > 0}
          onClear={() => {
            if (allowClear) {
              triggerChange();
            }

            setKey(+Date.now());
          }}
          {...triggerProps} // for form-control
        >
          {isMultiple ? (
            <SelectMultipleContent
              mode={mode}
              onInputClick={() => {
                handleOpenChange(true);
              }}
              selectedValues={selectedValues}
              onAdd={(value) => {
                triggerChange(value);
              }}
              onRemove={(value) => {
                triggerChange(value);
              }}
              placeholder={placeholder}
            />
          ) : (
            <SelectValue placeholder={placeholder} className="h-5" />
          )}
        </SelectTrigger>
        <SelectContent
          className={cn(
            "",
            options.some((o) => o.color)
              ? "data-radix-select-viewport:space-y-2"
              : "",
          )}
          // classNames={{
          //   viewport: options.some((o) => o.color) ? "space-y-2" : "",
          // }}
        >
          {ContentComp}
        </SelectContent>
      </SelectRoot>
    </SelectContext.Provider>
  );
};

export type { SelectProps };
export { Select };
