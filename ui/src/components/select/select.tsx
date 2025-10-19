"use client";

import type { VariantProps } from "class-variance-authority";
import React from "react";
import { tagColors } from "@/components/ui/tag";
import useControlledState from "@rc-component/util/lib/hooks/useControlledState";

import { cn } from "@acme/ui/lib/utils";

import type { AnyObject } from "../_util/type";
import type { inputSizeVariants, InputVariants } from "../input";
import type { SelectShadcnProps } from "./_components";
import type { FlattenOptionData, OptionType, SelectValueType } from "./types";
import { SelectContent, SelectItem, SelectRoot } from "../../shadcn/select";
import { Empty } from "../empty";
import { SelectTrigger, SelectValue } from "./_components";
import { SelectMultipleContent } from "./_components/select-multiple-content";

// export type SelectValue = React.ComponentProps<"select">["value"];
// export type SelectSingleValue = string | number;
// export type SelectMultipleValue = string[] | number[];
// export type SelectMode = "default" | "multiple" | "tags";

type SemanticName = "root";
type PopupSemantic = "root";

// type SelectValueType = string | number;

// type SelectDefaultProps<
//   TValue extends SelectValueType = string,
//   TRecord extends AnyObject = AnyObject,
// > = {
//   mode?: "default";
//   value?: TValue;
//   onChange?: (value?: TValue, option?: Option<TValue, TRecord>) => void;
// };

// type SelectMultipleOrTagsProps<
//   TValue extends SelectValueType = string,
//   TRecord extends AnyObject = AnyObject,
// > = {
//   mode: "multiple" | "tags";
//   value?: Array<TValue>;
//   onChange?: (
//     value?: Array<TValue>,
//     option?: Array<Option<TValue, TRecord>>,
//   ) => void;
// };

type SelectDefaultProps<
  TValue extends SelectValueType = SelectValueType,
  // ValueType = any,
  // OptionType extends BaseOptionType | DefaultOptionType = DefaultOptionType,
  // TOption extends OptionType = OptionType,
  TRecord extends AnyObject = AnyObject,
> = {
  mode?: never;

  defaultValue?: TValue;
  value?: TValue;
  onChange?: (value: TValue, option?: OptionType<TValue, TRecord>) => void;
  // onChange?: (
  //   value: ValueType,
  //   option?: OptionType<ValueType, TRecord>,
  // ) => void;
};

type SelectMultipleOrTagsProps<
  TValue extends SelectValueType = SelectValueType,
  // ValueType = any,
  // ValueType extends Array<SelectValueType> = Array<SelectValueType>,
  TRecord extends AnyObject = AnyObject,
  // OptionType extends BaseOptionType | DefaultOptionType = DefaultOptionType,
> = {
  mode: "multiple" | "tags";

  defaultValue?: TValue[];
  value?: TValue;
  onChange?: (value: TValue[], option?: OptionType<TValue, TRecord>[]) => void;
  // onChange?: (
  //   value: ValueType,
  //   option?: OptionType<ValueType, TRecord>[],
  // ) => void;
};

// type SelectWithoutAllowClearProps<
//   TValue = SelectValueType,
//   OptionType extends BaseOptionType | DefaultOptionType = DefaultOptionType,
// > =
//   | {
//       allowClear?: false;
//       mode?: never;

//       value: TValue;
//       onChange?: (value: TValue, option: OptionType) => void;
//     }
//   | {
//       allowClear?: false;
//       mode: "multiple" | "tags";
//       onChange?: (value: TValue[], option: OptionType[]) => void;
//     };

// type SelectAllowClearProps<
//   ValueType = any,
//   OptionType extends BaseOptionType | DefaultOptionType = DefaultOptionType,
// > = {
//   allowClear: true;
// } & (
//   | {
//       mode?: never;
//       onChange?: (value?: ValueType, option?: OptionType) => void;
//     }
//   | {
//       mode: "multiple" | "tags";
//       onChange?: (value?: ValueType, option?: OptionType[]) => void;
//     }
// );

type SelectProps<
  // TValue extends SelectValueType = string,

  // ValueType = any,
  TValue extends SelectValueType = SelectValueType,
  TRecord extends AnyObject = AnyObject,
  // TValue extends SelectValueType = SelectValueType,
  // OptionType extends BaseOptionType | DefaultOptionType = DefaultOptionType,
> = // | SelectDefaultProps<ValueType, OptionType<TValue, TRecord>>
(| SelectDefaultProps<TValue, OptionType<TValue, TRecord>>
  | SelectMultipleOrTagsProps<TValue, OptionType<TValue, TRecord>>
) &
  // | SelectMultipleOrTagsProps<ValueType, OptionType<TValue, TRecord>>
  Pick<SelectShadcnProps, "open" | "onOpenChange"> &
  // XOR<
  //   SelectDefaultProps<ValueType, OptionType>,
  //   SelectMultipleOrTagsProps<ValueType, OptionType>
  // > &
  InputVariants &
  VariantProps<typeof inputSizeVariants> & {
    id?: string;
    // mode?: "multiple" | "tags";

    // mode: "multiple" | "tags";

    // defaultValue?: ValueType;
    // value?: ValueType;
    // defaultValue?: TValue;
    // value?: TValue;
    // onChange?: (value: ValueType, option?: OptionType[]) => void;

    options?: OptionType<TValue, TRecord>[];
    placeholder?: string;
    allowClear?: boolean;

    // value?: TValue | null;
    // defaultValue?: TValue | null;
    maxCount?: number;
    // onChange?: (value: ValueType, option?: OptionType | OptionType[]) => void;

    // allowClear?: boolean;
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
    // optionsRender?: (options: Option<TValue, TRecord>[]) => React.ReactNode;
    onSearchChange?: (search: string) => void;
    // onChange?: (
    //   value?: TValue,
    //   option?: TValue extends Array<any>
    //     ? Array<Option<TValue, TRecord>>
    //     : Option<TValue, TRecord>,
    // ) => void;
    // mode?: SelectMode;

    // Base
    showSearch?: boolean;
  };

// type XorSelectProps<
//   TValue extends SelectValueType = number,
//   TRecord extends AnyObject = AnyObject,
// > = XOR<SelectProps<TValue, TRecord>, SelectShadcnProps>;

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
  if (!props.options) throw new Error("options is required");

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
    ...triggerProps
  } = props;

  // ======================= TAGS/MULTIPLE MODE =======================
  const isDefault = !mode;
  const isTags = mode === "tags";
  const isMultiple = mode === "multiple" || isTags;

  // const [internalOpen, setInternalOpen] = useControlledState(open, open);
  // const handleOpenChange = (open: boolean) => {
  //   setInternalOpen(open);
  //   onOpenChange?.(open);
  // };
  const [internalOpen, setInternalOpen] = useControlledState(open);
  // useEffect(() => {
  //   setInternalOpen(open);
  // }, [open]);
  const handleOpenChange = (open: boolean) => {
    setInternalOpen(open);
    onOpenChange?.(open);
  };

  // const tranformValue = useCallback(
  //   (value?: ValueType) => {
  //     return value === undefined
  //       ? []
  //       : isMultiple
  //         ? Array.isArray(value)
  //           ? value.filter((v): v is SelectValueType => v != null)
  //           : []
  //         : isDefault
  //           ? value == null
  //             ? []
  //             : ([value] as SelectValueType[])
  //           : [];
  //   },
  //   [isMultiple, isDefault],
  // );

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
    console.log("triggerChange", value);
    // const internalValue = (value);
    // setInternalValue(value);
    // onChange?.(value as ValueType, )
    if (value === undefined) {
      setInternalValue(undefined);
      //   if (isDefault) {
      //   setInternalValue(undefined);
      // } else if (isMultiple) {
      //   setInternalValue([]);
      // }
      // setInternalValue([]);
      // onChange?.(undefined as ValueType);
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
    // const newValue = isMultiple ? [...(internalValue ?? []), value] : value;
    // setInternalValue(newValue);
    // const returnOptions = options.filter((o) => newValue.includes(o.value));
    // if (props.mode === "multiple" || props.mode === "tags") {
    //   props.onChange?.(newValue, returnOptions);
    // } else {
    //   props.mode;
    //   props.onChange;
    //   props.onChange?.(newValue, returnOptions[0]!);
    // }
    // if (!mode) {
    //   onChange?.(newValue, returnOptions[0]!);
    // }
    // onChange?.(newValue, isMultiple ? returnOptions : returnOptions[0]);
  };

  // Content for dropdown
  const content = (
    <>
      {/* {isTags && inputValue && !options.some((o) => o.value === inputValue) && (
        <SelectItem
          value={inputValue}
          onSelect={() => addTag(inputValue as ValueType)}
          className="text-primary font-semibold"
        >
          Add "{inputValue}"
        </SelectItem>
      )} */}
      {options.length > 0 ? (
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

                // setInternalValue(
                //   isMultiple ? [...(internalValue ?? []), o.value as SelectValueType] : o.value as SelectValueType,
                // );
                // handleSelect(o.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  triggerChange(o.value);
                  // setInternalValue(
                  //   isMultiple ? [...(internalValue ?? []), o.value] : o.value,
                  // );
                  // handleSelect(o.value);
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
      )}
    </>
  );
  const ContentComp = dropdownRender ? dropdownRender(content) : content;

  console.log("ssss", internalOpen);
  return (
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
          console.log("onClear");
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
            ? "data-[radix-select-viewport]:space-y-2"
            : "",
        )}
        // classNames={{
        //   viewport: options.some((o) => o.color) ? "space-y-2" : "",
        // }}
      >
        {ContentComp}
      </SelectContent>
    </SelectRoot>
  );
};

export type { SelectProps };
export { Select };
