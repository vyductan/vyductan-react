/* eslint-disable @typescript-eslint/no-unsafe-return */
"use client";

import * as React from "react";
import { tagColors } from "@/components/ui/tag";
import { useMergedState } from "@rc-component/util";

import { Icon } from "@acme/ui/icons";
import { cn } from "@acme/ui/lib/utils";

import type { AnyObject } from "../_util/type";
import type { SizeType } from "../..";
import type { CommandProps } from "../command";
import type { PopoverContentProps } from "../popover";
import type { OptionType } from "../select/types";
import { Button, LoadingIcon } from "../button";
import { Command } from "../command";
import { Input } from "../input";
import { inputSizeVariants } from "../input/variants";
import { Popover } from "../popover";

type AutocompleteValueType = string | number;
export type AutocompleteProps<
  TValue extends AutocompleteValueType = string,
  TRecord extends AnyObject = AnyObject,
> = Pick<PopoverContentProps, "onFocusOutside"> &
  Pick<
    CommandProps<TValue>,
    | "filter"
    | "placeholder"
    | "empty"
    | "groupClassName"
    | "optionRender"
    | "optionsRender"
    | "dropdownRender"
    | "dropdownFooter"
  > & {
    mode?: "combobox" | "input";
    value?: TValue;
    defaultValue?: TValue;
    onChange?: (value?: TValue, option?: OptionType<TValue, TRecord>) => void;
    options: OptionType<TValue, TRecord>[];
    optionsToSearch?: { value: string; label: string }[];
    optionLabelProp?: string;

    className?: string;
    size?: SizeType;
    disabled?: boolean;

    open?: boolean;
    onOpenChange?: (open: boolean) => void;

    allowClear?: boolean;
    loading?: boolean;

    searchPlaceholder?: string;
    onSearchChange?: (search: string) => void;
  };

const Autocomplete = <
  TValue extends AutocompleteValueType = string,
  TRecord extends AnyObject = AnyObject,
>({
  mode = "combobox",
  defaultValue: defaultValueProp,
  value: valueProp,
  options,
  optionsToSearch,
  optionLabelProp,
  optionRender,

  className,
  size,
  disabled,
  open: openProp,
  onOpenChange,

  filter: filterProp,

  placeholder,

  allowClear,
  loading,

  onChange,

  searchPlaceholder,
  onSearchChange,

  // Popover
  onFocusOutside,
  ...props
}: AutocompleteProps<TValue, TRecord>) => {
  /* Filter Detault*/
  const filter =
    filterProp ??
    ((value, search, _) => {
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      const label = (optionsToSearch ?? options)
        .find((item) => item.value === value)
        ?.label?.toString();
      if (
        label &&
        removeTones(label.toLowerCase()).includes(
          removeTones(search.toLowerCase()),
        )
      ) {
        return 1;
      }
      return 0;
    });

  const [open, setOpen] = useMergedState(false, {
    value: openProp,
    onChange: onOpenChange,
  });
  const [value, setValue] = useMergedState(defaultValueProp, {
    value: valueProp,
    onChange: (value) => {
      onChange?.(
        value,
        options.find((o) => o.value === value),
      );
      setOpen(false);
      if (mode === "input") {
        // When a value is selected, reflect its label into the input text
        const o = options.find((o) => o.value === value);
        if (o) {
          setSearch(String(getOptionLabel(o)));
        } else {
          setSearch("");
        }
      }
    },
  });

  // ===================== Search (input mode) =====================
  const [search, setSearch] = React.useState<string>("");
  const getOptionLabel = (option: OptionType<TValue, TRecord>) => {
    if (optionLabelProp && option[optionLabelProp as keyof typeof option]) {
      return option[optionLabelProp as keyof typeof option];
    }
    return option.label as string;
  };
  // React.useEffect(() => {
  //   if (mode !== "input") return;
  //   // Initialize/sync input text from current value when it changes
  //   const o = options.find((o) => o.value === value);
  //   const next = o ? String(getOptionLabel(o)) : "";
  //   if (search !== next) {
  //     setSearch(next);
  //   }
  // }, [mode, value, getOptionLabel]);

  const buttonText = (() => {
    if (!value) {
      return placeholder ?? <span className="opacity-0"></span>;
    }
    const o = options.find((o) => o.value === value);
    if (o) {
      const label = optionRender?.label
        ? optionRender.label(o)
        : getOptionLabel(o);
      return (
        <>
          {optionRender?.icon ? (
            <span className="mr-2">{optionRender.icon(o)}</span>
          ) : (
            o.icon && <Icon icon={o.icon} />
          )}
          {label}
        </>
      );
    }

    return value;
  })();

  const gatedSetOpen = (next: boolean) => {
    // Prevent redundant state updates to avoid feedback loops with Popover
    if (next === open) return;
    if (mode === "input") {
      if (next) {
        setOpen(true);
        return;
      }
      // Close request
      setOpen(false);
      return;
    }
    setOpen(next);
  };

  const renderContent = (
    <Command
      mode="default"
      placeholder={searchPlaceholder}
      options={options}
      value={value}
      onChange={(v) => setValue(v)}
      filter={filter}
      onSearchChange={mode === "input" ? undefined : onSearchChange}
      optionRender={optionRender}
      {...props}
      // Input mode: drive filtering by external input
      {...(mode === "input"
        ? { searchValue: search, hideSearchInput: true }
        : {})}
    />
  );

  if (mode === "input") {
    // Input trigger mode
    const selectFirstIfSingle = () => {
      const matches = options.filter(
        (o) => filter(o.value.toString(), search) > 0,
      );
      if (matches.length === 1) {
        const only = matches[0];
        if (only) {
          setValue(only.value);
        }
        // search will be synced in setValue onChange above
      }
    };

    return (
      <Popover
        trigger="click"
        open={open}
        placement="bottomLeft"
        className={cn("p-0", "w-full min-w-(--radix-popover-trigger-width)")}
        arrow={false}
        content={renderContent}
        onFocusOutside={(e) => {
          setOpen(false);
          onFocusOutside?.(e);
        }}
      >
        <div>
          <Input
            size={size}
            disabled={disabled}
            value={search}
            onChange={(e) => {
              const next = e.target.value;
              setSearch(next);
              onSearchChange?.(next);
              if (!open) {
                setOpen(true);
              }
            }}
            // onFocus={() => {
            //   if (!open) {
            //     setOpen(true);
            //   }
            // }}
            onPressEnter={() => {
              if (search.trim().length === 0) return;
              selectFirstIfSingle();
            }}
            placeholder={placeholder}
            allowClear={allowClear}
            onClear={() => {
              setValue(undefined);
              setOpen(false);
            }}
            suffix={
              loading ? (
                <LoadingIcon className={cn("z-10 size-3.5")} />
              ) : undefined
            }
            className={className}
          />
        </div>
      </Popover>
    );
  }

  // Default combobox trigger
  return (
    <Popover
      trigger="click"
      open={open}
      onOpenChange={gatedSetOpen}
      placement="bottomLeft"
      className={cn(
        "p-0",
        //w-(--radix-popover-trigger-width)
        // own
        "w-full min-w-(--radix-popover-trigger-width)", // make same select width
      )}
      arrow={false}
      content={renderContent}
      onFocusOutside={onFocusOutside}
    >
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={open}
        size={size}
        disabled={disabled}
        className={cn(
          "group",
          "w-full justify-between font-normal",
          // own
          "hover:border-primary bg-transparent text-start text-sm whitespace-normal hover:bg-transparent",
          !value && "text-muted-foreground hover:text-muted-foreground",
          tagColors[options.find((o) => o.value === value)?.color ?? ""],
          "hover:" +
            tagColors[
              options.find((o) => o.value === value)?.color ?? ""
            ]?.slice(
              0,
              tagColors[
                options.find((o) => o.value === value)?.color ?? ""
              ]?.indexOf(" "),
            ),
          inputSizeVariants({ size }),
          className,
        )}
      >
        <span data-slot="select-selection-item" className="truncate">
          {buttonText}
        </span>

        <Icon
          icon="icon-[lucide--chevrons-up-down]"
          className={cn(
            "size-4 shrink-0 opacity-50",
            !buttonText && "ml-auto",
            allowClear &&
              value &&
              "transition-opacity duration-300 group-hover:opacity-0",
            loading && "opacity-0",
          )}
        />
        {allowClear && (
          <Icon
            role="button"
            icon="icon-[ant-design--close-circle-filled]"
            className={cn(
              "size-3.5",
              "z-10",
              "absolute right-3",
              "opacity-0 transition-opacity duration-300",
              // When no value, make the clear icon non-interactive so it doesn't block arrow clicks
              !value && "pointer-events-none",
              value && "group-hover:opacity-30",
              value && "hover:opacity-50",
            )}
            onClick={(e) => {
              if (!value) return; // don't intercept when nothing to clear
              e.preventDefault();
              e.stopPropagation();
              setValue(undefined);
            }}
          />
        )}
        {loading && (
          <LoadingIcon className={cn("absolute right-3 z-10 size-3.5")} />
        )}
      </Button>
    </Popover>
  );
};

export { Autocomplete };

export function removeTones(string_: string): string {
  return string_
    .normalize("NFD")
    .replaceAll(/[\u0300-\u036F]/g, "")
    .replaceAll("đ", "d")
    .replaceAll("Đ", "D");
}
