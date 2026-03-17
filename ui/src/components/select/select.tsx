"use client";

import type { VariantProps } from "class-variance-authority";
import React from "react";
import useControlledState from "@rc-component/util/lib/hooks/useControlledState";

import { tagColors } from "@acme/ui/components/tag";
import { cn } from "@acme/ui/lib/utils";

import type { AnyObject } from "../_util/type";
import type { inputSizeVariants, InputVariants } from "../input";
import type { SelectShadcnProps } from "./_components";
import type {
  FlattenOptionData,
  GroupOptionType,
  OptionType,
  SelectOption,
  SelectValueType,
} from "./types";
import { Empty } from "../empty";
import {
  PopoverContent,
  PopoverRoot,
  PopoverTrigger,
} from "../popover";
import { inputVariants } from "../input";
import {
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  Select as ShadcnSelect,
} from "./_components";
import { SelectClear } from "./_components/select-clear";
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
  value?: TValue[];
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
    options?: SelectOption<TValue, TRecord>[];
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
  } & React.AriaAttributes;

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
    showSearch: _showSearch, // Destructure to prevent it from being passed to DOM
    empty,
    ...triggerProps
  } = props;

  // ======================= TAGS/MULTIPLE MODE =======================
  const isDefault = !mode;
  const isTags = mode === "tags";
  const isMultiple = mode === "multiple" || isTags;

  const [internalOpen, setInternalOpen] = useControlledState(false, open);
  const [searchValue, setSearchValue] = React.useState("");
  const [activeTagOptionValue, setActiveTagOptionValue] = React.useState<
    TValue | undefined
  >();
  const shouldCommitOnBlurRef = React.useRef(true);
  const handleOpenChange = (open: boolean) => {
    if (disabled && open) return;
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

  const createOption = (value: TValue): OptionType<TValue, TRecord> =>
    ({
      label: String(value),
      value,
    }) as OptionType<TValue, TRecord>;

  const getTagLabel = (value: TValue) => {
    return flatOptions.find((option) => option.value === value)?.label ?? value;
  };

  const findMatchingOption = (rawValue: string) => {
    const normalizedValue = rawValue.trim();

    if (!normalizedValue) return undefined;

    return flatOptions.find(
      (option) =>
        String(option.value) === normalizedValue ||
        String(option.label) === normalizedValue,
    );
  };

  const triggerChange = (value?: TValue) => {
    if (value === undefined) {
      setInternalValue(undefined);
      setSearchValue("");
      return;
    } else if (isDefault) {
      setInternalValue(value);
      const returnOption = flatOptions.find((o) => value === o.value);
      onChange?.(value, returnOption);
      setInternalOpen(false);
    } else if (isMultiple) {
      const alreadySelected = selectedValues.includes(value);
      const newValue = alreadySelected
        ? selectedValues.filter((v) => v !== value)
        : [...selectedValues, value];
      setInternalValue(newValue);
      const returnOptions = newValue.map(
        (selectedValue) =>
          flatOptions.find((option) => option.value === selectedValue) ??
          createOption(selectedValue),
      );

      if (isTags && !alreadySelected) {
        setSearchValue("");
      }

      onChange?.(newValue, returnOptions);
    }
  };

  // Helper: is this a group option?
  const isGroup = (o: SelectOption): o is GroupOptionType =>
    "options" in o && Array.isArray((o as GroupOptionType).options);

  // Flatten all options (including those inside groups) for value lookup
  const flatOptions = options.flatMap((o) =>
    isGroup(o) ? o.options : [o as OptionType<TValue, TRecord>],
  );
  const trimmedSearchValue = searchValue.trim();
  const matchedSearchOption = findMatchingOption(trimmedSearchValue);
  const resolvedSearchValue =
    matchedSearchOption?.value ?? (trimmedSearchValue as TValue);
  const hasSelectedSearchValue = selectedValues.includes(resolvedSearchValue);
  const temporaryTagOption =
    isTags && trimmedSearchValue && !hasSelectedSearchValue && !matchedSearchOption
      ? createOption(trimmedSearchValue as TValue)
      : undefined;
  const matchesSearch = (option: OptionType<TValue, TRecord>) => {
    if (!isTags || !trimmedSearchValue) return true;

    return [option.label, option.value].some((field) =>
      String(field ?? "").includes(trimmedSearchValue),
    );
  };
  const filteredOptions = isTags
    ? options.reduce<SelectOption<TValue, TRecord>[]>((acc, option) => {
        if (isGroup(option)) {
          const matchedOptions = option.options.filter(matchesSearch);

          if (matchedOptions.length > 0) {
            acc.push({
              ...option,
              options: matchedOptions,
            });
          }

          return acc;
        }

        if (matchesSearch(option as OptionType<TValue, TRecord>)) {
          acc.push(option);
        }

        return acc;
      }, [])
    : options;
  const persistedCustomTagOptions = isTags
    ? selectedValues.reduce<OptionType<TValue, TRecord>[]>((acc, selectedValue) => {
        const hasExistingOption = flatOptions.some(
          (option) => option.value === selectedValue,
        );

        if (!hasExistingOption && matchesSearch(createOption(selectedValue))) {
          acc.push(createOption(selectedValue));
        }

        return acc;
      }, [])
    : [];
  const displayOptions = [
    ...(temporaryTagOption ? [temporaryTagOption] : []),
    ...persistedCustomTagOptions,
    ...filteredOptions,
  ].filter(
    (option, index, array) =>
      array.findIndex((candidate) => {
        if (isGroup(candidate) || isGroup(option)) {
          return candidate === option;
        }

        return candidate.value === option.value;
      }) === index,
  );
  const flatDisplayOptions = displayOptions.flatMap((option) =>
    isGroup(option) ? option.options : [option],
  );

  React.useEffect(() => {
    if (!isTags || !internalOpen) {
      setActiveTagOptionValue(undefined);
      return;
    }

    setActiveTagOptionValue((currentValue) => {
      if (
        currentValue !== undefined &&
        flatDisplayOptions.some((option) => option.value === currentValue)
      ) {
        return currentValue;
      }

      return undefined;
    });
  }, [flatDisplayOptions, internalOpen, isTags]);

  const submitTagValue = (rawValue: string) => {
    const nextValue = rawValue.trim();
    if (!nextValue) return;

    const resolvedValue = (findMatchingOption(nextValue)?.value ?? nextValue) as TValue;

    if (selectedValues.includes(resolvedValue)) {
      setSearchValue("");
      return;
    }

    triggerChange(resolvedValue);
  };

  const selectActiveTagOption = () => {
    if (activeTagOptionValue === undefined) return;
    triggerChange(activeTagOptionValue);
  };

  const moveActiveTagOption = (direction: 1 | -1) => {
    if (!flatDisplayOptions.length) return;

    const currentIndex = flatDisplayOptions.findIndex(
      (option) => option.value === activeTagOptionValue,
    );
    const nextIndex =
      currentIndex === -1
        ? direction === 1
          ? 0
          : flatDisplayOptions.length - 1
        : (currentIndex + direction + flatDisplayOptions.length) %
          flatDisplayOptions.length;

    setActiveTagOptionValue(flatDisplayOptions[nextIndex]?.value);
  };

  const handleTagsInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!internalOpen) {
        handleOpenChange(true);
        setActiveTagOptionValue(flatDisplayOptions[0]?.value);
        return;
      }

      moveActiveTagOption(1);
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!internalOpen) {
        handleOpenChange(true);
        setActiveTagOptionValue(
          flatDisplayOptions[flatDisplayOptions.length - 1]?.value,
        );
        return;
      }

      moveActiveTagOption(-1);
      return;
    }

    if (e.key === "Enter" && internalOpen && activeTagOptionValue !== undefined) {
      e.preventDefault();
      selectActiveTagOption();
      return;
    }

    if (e.key === "Escape" && internalOpen) {
      e.preventDefault();
      handleOpenChange(false);
    }
  };

  const isActiveTagsOption = (optionValue: TValue) =>
    optionValue === activeTagOptionValue ||
    selectedValues.includes(optionValue) ||
    (isTags &&
      trimmedSearchValue !== "" &&
      !activeTagOptionValue &&
      optionValue === trimmedSearchValue);

  // Content for dropdown
  const content = (
    <>
      {children ??
        (displayOptions.length > 0 ? (
          displayOptions.map((o, oIndex) => {
            // ─── Group ───────────────────────────────────────────
            if (isGroup(o)) {
              return (
                <SelectGroup key={`group-${oIndex}`}>
                  {o.label && (
                    <SelectLabel className="text-muted-foreground text-[10px] font-semibold tracking-widest uppercase">
                      {o.label}
                    </SelectLabel>
                  )}
                  {o.options.map((item, itemIndex) => {
                    const optionContent = optionRender
                      ? optionRender(
                          {
                            label: item.label,
                            data: item,
                            key: String(item.value),
                            value: item.value,
                          },
                          { index: itemIndex },
                        )
                      : item.label;
                    return (
                      <SelectItem
                        key={String(item.value)}
                        value={item.value as string}
                        className={cn(
                          selectedValues.includes(item.value)
                            ? "bg-primary-100 focus:bg-primary-100 hover:bg-primary-100 [&>span>span[role='img']]:text-primary-600"
                            : "",
                          item.color && tagColors[item.color],
                        )}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          triggerChange(item.value);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            e.stopPropagation();
                            triggerChange(item.value);
                          }
                        }}
                      >
                        {optionContent}
                      </SelectItem>
                    );
                  })}
                </SelectGroup>
              );
            }

            // ─── Flat option ─────────────────────────────────────
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
  const tagsContent = dropdownRender ? (
    dropdownRender(
      <div className="max-h-80 overflow-y-auto p-1">
        {displayOptions.length > 0 ? (
          displayOptions.map((option, optionIndex) => {
            if (isGroup(option)) {
              return (
                <div key={`tags-group-${optionIndex}`} className="space-y-1">
                  {option.label && (
                    <div className="text-muted-foreground px-2 py-1 text-[10px] font-semibold tracking-widest uppercase">
                      {option.label}
                    </div>
                  )}
                  {option.options.map((item, itemIndex) => {
                    const optionContent = optionRender
                      ? optionRender(
                          {
                            label: item.label,
                            data: item,
                            key: String(item.value),
                            value: item.value,
                          },
                          { index: itemIndex },
                        )
                      : item.label;

                    return (
                      <button
                        key={String(item.value)}
                        type="button"
                        className={cn(
                          "hover:bg-accent hover:text-accent-foreground flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm",
                          isActiveTagsOption(item.value) &&
                            "bg-primary-100 text-primary-600",
                          item.color && tagColors[item.color],
                        )}
                        onMouseDown={(event) => {
                          event.preventDefault();
                          shouldCommitOnBlurRef.current = false;
                        }}
                        onClick={() => {
                          shouldCommitOnBlurRef.current = true;
                          if (disabled) return;
                          triggerChange(item.value);
                        }}
                      >
                        <span className="min-w-0 flex-1">{optionContent}</span>
                      </button>
                    );
                  })}
                </div>
              );
            }

            const optionContent = optionRender
              ? optionRender(
                  {
                    label: option.label,
                    data: option,
                    key: String(option.value),
                    value: option.value,
                  },
                  { index: optionIndex },
                )
              : option.label;

            return (
              <button
                key={String(option.value)}
                type="button"
                className={cn(
                  "hover:bg-accent hover:text-accent-foreground flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm",
                  isActiveTagsOption(option.value) &&
                    "bg-primary-100 text-primary-600",
                  option.color && tagColors[option.color],
                )}
                onMouseDown={(event) => {
                  event.preventDefault();
                  shouldCommitOnBlurRef.current = false;
                }}
                onClick={() => {
                  shouldCommitOnBlurRef.current = true;
                  if (disabled) return;
                  triggerChange(option.value);
                }}
              >
                <span className="min-w-0 flex-1">{optionContent}</span>
              </button>
            );
          })
        ) : (
          <div className="p-1">{empty ?? <Empty />}</div>
        )}
      </div>,
    )
  ) : (
    <div className="max-h-80 overflow-y-auto p-1">
      {displayOptions.length > 0 ? (
        displayOptions.map((option, optionIndex) => {
          if (isGroup(option)) {
            return (
              <div key={`tags-group-${optionIndex}`} className="space-y-1">
                {option.label && (
                  <div className="text-muted-foreground px-2 py-1 text-[10px] font-semibold tracking-widest uppercase">
                    {option.label}
                  </div>
                )}
                {option.options.map((item, itemIndex) => {
                  const optionContent = optionRender
                    ? optionRender(
                        {
                          label: item.label,
                          data: item,
                          key: String(item.value),
                          value: item.value,
                        },
                        { index: itemIndex },
                      )
                    : item.label;

                  return (
                    <button
                      key={String(item.value)}
                      type="button"
                      className={cn(
                        "hover:bg-accent hover:text-accent-foreground flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm",
                        isActiveTagsOption(item.value) &&
                          "bg-primary-100 text-primary-600",
                        item.color && tagColors[item.color],
                      )}
                      onMouseDown={(event) => {
                        event.preventDefault();
                        shouldCommitOnBlurRef.current = false;
                      }}
                      onClick={() => {
                        shouldCommitOnBlurRef.current = true;
                        if (disabled) return;
                        triggerChange(item.value);
                      }}
                    >
                      <span className="min-w-0 flex-1">{optionContent}</span>
                    </button>
                  );
                })}
              </div>
            );
          }

          const optionContent = optionRender
            ? optionRender(
                {
                  label: option.label,
                  data: option,
                  key: String(option.value),
                  value: option.value,
                },
                { index: optionIndex },
              )
            : option.label;

          return (
            <button
              key={String(option.value)}
              type="button"
              className={cn(
                "hover:bg-accent hover:text-accent-foreground flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm",
                isActiveTagsOption(option.value) &&
                  "bg-primary-100 text-primary-600",
                option.color && tagColors[option.color],
              )}
              onMouseDown={(event) => {
                event.preventDefault();
                shouldCommitOnBlurRef.current = false;
              }}
              onClick={() => {
                shouldCommitOnBlurRef.current = true;
                if (disabled) return;
                triggerChange(option.value);
              }}
            >
              <span className="min-w-0 flex-1">{optionContent}</span>
            </button>
          );
        })
      ) : (
        <div className="p-1">{empty ?? <Empty />}</div>
      )}
    </div>
  );

  if (isTags) {
    return (
      <SelectContext.Provider
        value={{
          selectedValues,
          triggerChange: triggerChange as (value?: SelectValueType) => void,
        }}
      >
        <PopoverRoot open={internalOpen} onOpenChange={handleOpenChange}>
          <PopoverTrigger asChild>
            <div>
              <div
                id={id}
                aria-label={placeholder}
                className={cn(
                  "group relative flex w-full min-h-control items-center rounded-md",
                  inputVariants({ variant, status, disabled }),
                  "h-auto py-1 pr-8 pl-[3px]",
                  className,
                )}
                {...triggerProps}
              >
                <SelectMultipleContent
                  mode={mode}
                  open={internalOpen}
                  disabled={disabled}
                  onInputClick={() => {
                    if (disabled) return;
                    handleOpenChange(true);
                  }}
                  selectedValues={selectedValues}
                  getTagLabel={getTagLabel}
                  onAdd={(value) => {
                    if (disabled) return;
                    triggerChange(value);
                  }}
                  onRemove={(value) => {
                    if (disabled) return;
                    triggerChange(value);
                  }}
                  inputValue={searchValue}
                  onInputValueChange={setSearchValue}
                  onInputKeyDown={handleTagsInputKeyDown}
                  onInputSubmit={() => {
                    submitTagValue(searchValue);
                  }}
                  onInputBlur={() => {
                    if (!shouldCommitOnBlurRef.current) {
                      shouldCommitOnBlurRef.current = true;
                      return;
                    }

                    submitTagValue(searchValue);
                  }}
                  placeholder={placeholder}
                />
                <SelectClear
                  allowClear={!disabled && allowClear}
                  showClearIcon={!disabled && selectedValues.length > 0}
                  onPointerDown={() => {
                    if (disabled) return;

                    if (allowClear) {
                      triggerChange();
                    }

                    setKey(+Date.now());
                  }}
                />
              </div>
            </div>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            side="bottom"
            sideOffset={4}
            className="w-[var(--radix-popover-trigger-width)] p-0"
            onOpenAutoFocus={(event) => {
              event.preventDefault();
            }}
          >
            {tagsContent}
          </PopoverContent>
        </PopoverRoot>
      </SelectContext.Provider>
    );
  }

  return (
    <SelectContext.Provider
      value={{
        selectedValues,
        triggerChange: triggerChange as (value?: SelectValueType) => void,
      }}
    >
      <ShadcnSelect
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
          aria-label={placeholder}
          loading={loading}
          disabled={disabled}
          className={cn(
            "w-full",
            isMultiple && "min-h-control h-auto pl-[3px] items-center py-1",
            tagColors[flatOptions.find((o) => o.value === value)?.color ?? ""],
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
            <>
              <SelectMultipleContent
                mode={mode}
                open={internalOpen}
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
                inputValue={isTags ? searchValue : undefined}
                onInputValueChange={isTags ? setSearchValue : undefined}
                onInputSubmit={
                  isTags
                    ? () => {
                        const nextValue = searchValue.trim();
                        if (nextValue) {
                          triggerChange(nextValue as TValue);
                        }
                      }
                    : undefined
                }
                placeholder={placeholder}
              />
              <div className="sr-only">
                <SelectValue placeholder={placeholder} />
              </div>
            </>
          ) : (
            <SelectValue placeholder={placeholder} className="h-5" />
          )}
        </SelectTrigger>
        <SelectContent
          position="popper"
          sideOffset={4}
          className={cn(
            "",
            flatOptions.some((o) => o.color)
              ? "data-radix-select-viewport:space-y-2"
              : "",
          )}
          // classNames={{
          //   viewport: options.some((o) => o.color) ? "space-y-2" : "",
          // }}
        >
          {ContentComp}
        </SelectContent>
      </ShadcnSelect>
    </SelectContext.Provider>
  );
};

export type { SelectProps };
export { Select };
