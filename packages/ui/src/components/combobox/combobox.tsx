"use client";

import * as React from "react";
import useControlledState from "@rc-component/util/es/hooks/useControlledState";

import {
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  useComboboxAnchor,
} from "@acme/ui/shadcn/combobox";

import type { AnyObject } from "../_util/type";
import type {
  OptionType,
  RenderNode,
  SelectOption,
  SelectValueType,
} from "../select/types";
import { ComboboxClear } from "./_components/combobox-clear";
import { ComboboxPrimitive } from "./primitive-combobox";

type ComboboxDefaultProperties<
  TValue extends SelectValueType = SelectValueType,
  TRecord extends AnyObject = AnyObject,
> = {
  mode?: never;
  value?: TValue;
  defaultValue?: TValue;
  onChange?: ComboboxOnChangeSingle<TValue, TRecord>;
};

type ComboboxMultipleOrTagsProperties<
  TValue extends SelectValueType = SelectValueType,
  TRecord extends AnyObject = AnyObject,
> = {
  mode: "multiple" | "tags";
  value?: TValue[];
  defaultValue?: TValue[];
  onChange?: ComboboxOnChangeMultiple<TValue, TRecord>;
};

type ComboboxProperties<
  TValue extends SelectValueType = SelectValueType,
  TRecord extends AnyObject = AnyObject,
> = (
  | ComboboxDefaultProperties<TValue, TRecord>
  | ComboboxMultipleOrTagsProperties<TValue, TRecord>
) & {
  options: SelectOption<TValue, TRecord>[];
  placeholder?: string;
  allowClear?: boolean | { clearIcon?: RenderNode };
};

type ComboboxOnChangeSingle<
  TValue extends SelectValueType = SelectValueType,
  TRecord extends AnyObject = AnyObject,
> = (value?: TValue, option?: OptionType<TValue, TRecord>) => void;

type ComboboxOnChangeMultiple<
  TValue extends SelectValueType = SelectValueType,
  TRecord extends AnyObject = AnyObject,
> = (value?: TValue[], option?: OptionType<TValue, TRecord>[]) => void;

type ComboboxValue<TValue extends SelectValueType = SelectValueType> =
  | TValue
  | TValue[]
  | undefined;

type ComboboxGroupOption<
  TValue extends SelectValueType = SelectValueType,
  TRecord extends AnyObject = AnyObject,
> = Extract<
  SelectOption<TValue, TRecord>,
  { options: OptionType<TValue, TRecord>[] }
>;

type ComboboxCollectionGroup<
  TValue extends SelectValueType = SelectValueType,
  TRecord extends AnyObject = AnyObject,
> = {
  key: string;
  label?: React.ReactNode;
  items: OptionType<TValue, TRecord>[];
};

const isGroupOption = <
  TValue extends SelectValueType = SelectValueType,
  TRecord extends AnyObject = AnyObject,
>(
  option: SelectOption<TValue, TRecord>,
): option is ComboboxGroupOption<TValue, TRecord> => {
  return "options" in option && Array.isArray(option.options);
};

const getOptionLabel = <
  TValue extends SelectValueType = SelectValueType,
  TRecord extends AnyObject = AnyObject,
>(
  option: OptionType<TValue, TRecord>,
) => {
  return option.label ?? option.value;
};

const createOption = <
  TValue extends SelectValueType = SelectValueType,
  TRecord extends AnyObject = AnyObject,
>(
  value: TValue,
): OptionType<TValue, TRecord> => {
  return {
    label: String(value),
    value,
  } as OptionType<TValue, TRecord>;
};

const findCanonicalOption = <
  TValue extends SelectValueType = SelectValueType,
  TRecord extends AnyObject = AnyObject,
>(
  options: OptionType<TValue, TRecord>[],
  input: string,
) => {
  return options.find((option) => {
    return (
      String(option.value) === input ||
      String(getOptionLabel(option)).trim() === input
    );
  });
};

const optionMatchesQuery = <
  TValue extends SelectValueType = SelectValueType,
  TRecord extends AnyObject = AnyObject,
>(
  option: OptionType<TValue, TRecord>,
  query: string,
) => {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  return [String(getOptionLabel(option)), String(option.value)].some(
    (candidate) => {
      return candidate.toLowerCase().includes(normalizedQuery);
    },
  );
};

function Combobox<
  TValue extends SelectValueType = SelectValueType,
  TRecord extends AnyObject = AnyObject,
>({
  mode,
  options,
  value,
  defaultValue,
  placeholder,
  allowClear,
  onChange,
}: ComboboxProperties<TValue, TRecord>): React.JSX.Element {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const [internalValue, setInternalValue] = useControlledState<
    ComboboxValue<TValue>
  >(defaultValue as ComboboxValue<TValue>, value as ComboboxValue<TValue>);
  const chipsAnchorReference = useComboboxAnchor();
  const isMultiple = mode === "multiple" || mode === "tags";

  const flatOptions = React.useMemo(() => {
    return options.flatMap((option) =>
      isGroupOption(option) ? option.options : [option],
    );
  }, [options]);
  const groupedOptions = React.useMemo(() => {
    const nextGroups: ComboboxCollectionGroup<TValue, TRecord>[] = [];
    let ungroupedOptions: OptionType<TValue, TRecord>[] = [];

    for (const [index, option] of options.entries()) {
      if (isGroupOption(option)) {
        if (ungroupedOptions.length > 0) {
          nextGroups.push({
            key: `group-ungrouped-${index}`,
            items: ungroupedOptions,
          });
          ungroupedOptions = [];
        }

        nextGroups.push({
          key: `group-${index}`,
          label: option.label,
          items: option.options,
        });
        continue;
      }

      ungroupedOptions.push(option);
    }

    if (ungroupedOptions.length > 0) {
      nextGroups.push({
        key: `group-ungrouped-final`,
        items: ungroupedOptions,
      });
    }

    return nextGroups;
  }, [options]);
  const filteredItems = React.useMemo(() => {
    const normalizedQuery = inputValue.trim();

    if (!normalizedQuery) {
      return groupedOptions;
    }

    const nextGroups = groupedOptions.flatMap((group) => {
      const matchedItems = group.items.filter((option) => {
        return optionMatchesQuery(option, normalizedQuery);
      });

      if (matchedItems.length === 0) {
        return [] as ComboboxCollectionGroup<TValue, TRecord>[];
      }

      return [
        {
          ...group,
          items: matchedItems,
        },
      ];
    });

    return nextGroups;
  }, [groupedOptions, inputValue]);
  const mergedAllowClear = !!allowClear;
  const isTags = mode === "tags";
  const selectedValues = React.useMemo(() => {
    if (!isMultiple) {
      return [] as TValue[];
    }

    return Array.isArray(internalValue) ? internalValue : [];
  }, [internalValue, isMultiple]);
  const selectedOptions = React.useMemo(() => {
    return selectedValues.map<OptionType<TValue, TRecord>>((selectedValue) => {
      const option = flatOptions.find((item) => item.value === selectedValue);

      if (option) {
        return option;
      }

      return createOption<TValue, TRecord>(selectedValue);
    });
  }, [flatOptions, selectedValues]);
  const selectedSingleOption = React.useMemo(() => {
    if (
      isMultiple ||
      internalValue === undefined ||
      Array.isArray(internalValue)
    ) {
      return;
    }

    return flatOptions.find((item) => item.value === internalValue);
  }, [flatOptions, internalValue, isMultiple]);
  const showClearIcon = isMultiple
    ? selectedValues.length > 0
    : internalValue !== undefined;

  React.useEffect(() => {
    if (isMultiple) {
      return;
    }

    if (internalValue === undefined || Array.isArray(internalValue)) {
      setInputValue("");
      return;
    }

    setInputValue(
      selectedSingleOption
        ? String(getOptionLabel(selectedSingleOption))
        : String(internalValue),
    );
  }, [internalValue, isMultiple, selectedSingleOption]);

  const clearValue = React.useCallback(() => {
    if (isMultiple) {
      setInternalValue([] as TValue[] as ComboboxValue<TValue>);
      (
        onChange as
          | ((value?: TValue[], option?: OptionType<TValue, TRecord>[]) => void)
          | undefined
      )?.([], []);
      setOpen(false);
      return;
    }

    const clearedValue = undefined as TValue | undefined;
    const clearedOption = undefined as OptionType<TValue, TRecord> | undefined;

    setInternalValue(undefined);
    (
      onChange as
        | ((value?: TValue, option?: OptionType<TValue, TRecord>) => void)
        | undefined
    )?.(clearedValue, clearedOption);
    setOpen(false);
  }, [isMultiple, onChange, setInternalValue]);

  const commitTagValue = React.useCallback(
    (rawValue: string) => {
      const normalizedValue = rawValue.trim();

      if (!isTags || !normalizedValue) {
        return false;
      }

      const nextOption = findCanonicalOption(flatOptions, normalizedValue);
      const resolvedOption =
        nextOption ?? createOption<TValue, TRecord>(normalizedValue as TValue);
      const nextValues = [
        ...new Set([...selectedValues, resolvedOption.value as TValue]),
      ];
      const nextOptions = nextValues.map((selectedValue) => {
        return (
          flatOptions.find((option) => option.value === selectedValue) ??
          createOption<TValue, TRecord>(selectedValue)
        );
      });

      setInternalValue(nextValues as ComboboxValue<TValue>);
      (
        onChange as
          | ((value?: TValue[], option?: OptionType<TValue, TRecord>[]) => void)
          | undefined
      )?.(nextValues, nextOptions);
      setInputValue("");
      setOpen(false);

      return true;
    },
    [flatOptions, isTags, onChange, selectedValues, setInternalValue],
  );

  const items = React.useMemo(() => {
    return groupedOptions;
  }, [groupedOptions]);

  const handleInputValueChange = React.useCallback(
    (nextInputValue: string, details?: { reason?: string }) => {
      if (!isMultiple && details?.reason === "item-press") {
        return;
      }

      if (
        !isMultiple &&
        !open &&
        selectedSingleOption &&
        nextInputValue === String(selectedSingleOption.value)
      ) {
        setInputValue(String(getOptionLabel(selectedSingleOption)));
        return;
      }

      setInputValue(nextInputValue);
    },
    [isMultiple, open, selectedSingleOption],
  );

  const handleValueChange = React.useCallback(
    (
      nextValue:
        | OptionType<TValue, TRecord>[]
        | OptionType<TValue, TRecord>
        | null,
    ) => {
      if (nextValue === null) {
        return;
      }

      if (isMultiple) {
        const nextOptions = Array.isArray(nextValue) ? nextValue : [nextValue];
        const nextValues = nextOptions.map((option) => option.value as TValue);

        setInternalValue(nextValues as ComboboxValue<TValue>);
        (
          onChange as
            | ((
                value?: TValue[],
                option?: OptionType<TValue, TRecord>[],
              ) => void)
            | undefined
        )?.(nextValues, nextOptions);
        return;
      }

      const nextOption = Array.isArray(nextValue) ? nextValue[0] : nextValue;

      if (!nextOption) {
        return;
      }

      setInternalValue(nextOption.value as ComboboxValue<TValue>);
      (
        onChange as
          | ((value?: TValue, option?: OptionType<TValue, TRecord>) => void)
          | undefined
      )?.(nextOption.value as TValue, nextOption);
      setOpen(false);
    },
    [isMultiple, onChange, setInternalValue],
  );

  const comboboxItems = (
    <>
      <ComboboxEmpty>No options found.</ComboboxEmpty>
      <ComboboxList>
        {(group: ComboboxCollectionGroup<TValue, TRecord>) => {
          return (
            <ComboboxGroup key={group.key} items={group.items}>
              {group.label !== undefined && (
                <ComboboxLabel>{group.label}</ComboboxLabel>
              )}
              <ComboboxCollection>
                {(option: OptionType<TValue, TRecord>) => {
                  return (
                    <ComboboxItem
                      key={String(option.value)}
                      value={option}
                      onClick={() => {
                        option.onSelect?.();
                      }}
                    >
                      {getOptionLabel(option)}
                    </ComboboxItem>
                  );
                }}
              </ComboboxCollection>
            </ComboboxGroup>
          );
        }}
      </ComboboxList>
    </>
  );

  if (isMultiple) {
    return (
      <ComboboxPrimitive
        multiple
        items={items}
        open={open}
        onOpenChange={setOpen}
        inputValue={inputValue}
        onInputValueChange={handleInputValueChange}
        value={selectedOptions}
        onValueChange={handleValueChange}
        filteredItems={filteredItems}
        itemToStringLabel={(option) => String(getOptionLabel(option))}
        itemToStringValue={(option) => String(option.value)}
      >
        <div
          ref={chipsAnchorReference}
          className="group/input-group relative w-auto"
        >
          <div data-slot="input-group">
            <ComboboxChips>
              {selectedOptions.map((option) => (
                <ComboboxChip key={String(option.value)}>
                  {getOptionLabel(option)}
                </ComboboxChip>
              ))}
              <ComboboxChipsInput
                placeholder={placeholder}
                onKeyDown={(event) => {
                  if (event.key !== "Enter") {
                    return;
                  }

                  if (commitTagValue(event.currentTarget.value)) {
                    event.preventDefault();
                  }
                }}
              />
            </ComboboxChips>
          </div>
          {mergedAllowClear && (
            <ComboboxClear
              allowClear={allowClear}
              showClearIcon={showClearIcon}
              onPointerDown={() => {
                clearValue();
              }}
              onClear={() => {
                clearValue();
              }}
            />
          )}
        </div>
        <ComboboxContent anchor={chipsAnchorReference}>
          {comboboxItems}
        </ComboboxContent>
      </ComboboxPrimitive>
    );
  }

  return (
    <ComboboxPrimitive
      items={items}
      open={open}
      onOpenChange={setOpen}
      inputValue={inputValue}
      onInputValueChange={handleInputValueChange}
      value={selectedSingleOption}
      onValueChange={handleValueChange}
      filteredItems={filteredItems}
      itemToStringLabel={(option) => String(getOptionLabel(option))}
      itemToStringValue={(option) => String(option.value)}
    >
      <div className="group/input-group relative w-auto">
        <ComboboxInput placeholder={placeholder} showTrigger />
        {mergedAllowClear && (
          <ComboboxClear
            allowClear={allowClear}
            showClearIcon={showClearIcon}
            onPointerDown={() => {
              clearValue();
            }}
            onClear={() => {
              clearValue();
            }}
          />
        )}
      </div>
      <ComboboxContent>{comboboxItems}</ComboboxContent>
    </ComboboxPrimitive>
  );
}

export type { ComboboxProperties as ComboboxProps };
export { Combobox };
