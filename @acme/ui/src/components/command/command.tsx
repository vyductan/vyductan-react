import type { XOR } from "ts-xor";
import { useMergedState } from "@rc-component/util";

import { tagColors } from "@acme/ui/components/tag";
import { cn } from "@acme/ui/lib/utils";

import type { OptionType } from "../select/types";
import type { CommandRootProps as CommandRootProperties } from "./_components";
import { Icon } from "../../icons";
import {
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandRoot,
} from "./_components";
import { defaultEmpty, defaultPlaceholder } from "./config";

type ShadcnCommandProperties = React.ComponentProps<typeof CommandRoot>;

type CommandValueType = string | number;

type CommandSingleValue<TValue extends CommandValueType = string> = {
  mode?: "default";
  value?: TValue;
  defaultValue?: TValue;
  onChange?: (value?: TValue, option?: OptionType<TValue>) => void;
};
type CommandMultipleValue<TValue extends CommandValueType = string> = {
  mode: "multiple" | "tags";
  value?: TValue[];
  defaultValue?: TValue[];
  onChange?: (value: TValue[], options?: OptionType<TValue>[]) => void;
};

export type OwnCommandProps<TValue extends CommandValueType = string> = Omit<
  CommandRootProperties,
  "defaultValue" | "value" | "onChange"
> &
  (CommandSingleValue<TValue> | CommandMultipleValue<TValue>) & {
    options: OptionType<TValue>[];

    empty?: React.ReactNode;
    placeholder?: string;

    onSearchChange?: (search: string) => void;
    /**
     * Control the search input value programmatically.
     * Useful when you want to render your own external input but still leverage cmdk filtering.
     */
    searchValue?: string;
    /**
     * Hide the internal CommandInput UI while keeping it in the DOM to drive filtering.
     */
    hideSearchInput?: boolean;

    groupClassName?: string;
    optionRender?: {
      checked?: boolean;
      icon?: (option: OptionType<TValue>) => React.ReactNode;
      label?: (option: OptionType<TValue>) => React.ReactNode;
    };
    optionsRender?: (options: OptionType<TValue>[]) => React.ReactNode;

    dropdownRender?: (originalNode: React.ReactNode) => React.ReactNode;
    dropdownFooter?: React.ReactNode;
  };

type CommandProperties<TValue extends CommandValueType = string> = XOR<
  OwnCommandProps<TValue>,
  ShadcnCommandProperties
>;

const Command = <TValue extends CommandValueType = string>(
  properties: CommandProperties<TValue>,
) => {
  const [value, setValue] = useMergedState(properties.defaultValue, {
    value: properties.value,
    onChange: (value) => {
      if ((mode === undefined || mode === "default") && !Array.isArray(value)) {
        const option = options.find((o) => o.value === value);
        onChange?.(option?.value, option);
        return;
      } else if (mode === "multiple" && Array.isArray(value)) {
        onChange?.(
          value,
          options.filter((o) => value.includes(o.value)),
        );
        return;
      }
    },
  });

  const isShadcnCommand = !properties.options;
  if (isShadcnCommand) {
    return (
      <CommandRoot
        {...properties}
        defaultValue={properties.defaultValue?.toString()}
        value={properties.value?.toString()}
        onChange={properties.onChange}
      />
    );
  }
  const {
    mode,
    options,
    defaultValue: _defaultValue,
    value: _value,
    empty,
    placeholder,
    onSearchChange,
    searchValue,
    hideSearchInput,

    groupClassName,
    optionRender,
    optionsRender,
    dropdownRender,
    onChange,

    filter,

    dropdownFooter,
  } = properties;
  // ======================= TAGS/MULTIPLE MODE =======================
  // const isDefault = !mode || mode === "default";
  // const isTags = mode === "tags";
  // const isMultiple = mode === "multiple" || isTags;

  const panel = (
    <CommandList>
      <CommandEmpty>{empty ?? defaultEmpty}</CommandEmpty>
      <CommandGroup className={groupClassName}>
        {/* to allow user set value that not in options - update 20250224 should not show - same antd */}
        {/* {!Array.isArray(value) &&
          !!value &&
          !options.some((o) => o.value === value) &&
          value !== "" && (
            <CommandItem checked={true} value={value as string}>
              {value}
            </CommandItem>
          )} */}
        {options.length > 0 ? (
          optionsRender ? (
            optionsRender(options)
          ) : (
            options.map((o) => (
              <CommandItem
                key={o.value.toString()}
                value={o.value.toString()}
                onSelect={() => {
                  if (mode === "multiple" && Array.isArray(value)) {
                    if (value.includes(o.value)) {
                      setValue(value.filter((x) => x !== o.value));
                    } else {
                      setValue([...value, o.value]);
                    }
                  } else {
                    setValue(o.value);
                  }
                  o.onSelect?.();
                }}
                checked={
                  o.checked ??
                  (Array.isArray(value)
                    ? value.includes(o.value)
                    : value === o.value)
                }
                className={cn(
                  o.color ? tagColors[o.color] : "",
                  o.color ? "hover:bg-current/10" : "",
                  o.className,
                )}
              >
                {optionRender?.icon ? (
                  <span className="mr-2">{optionRender.icon(o)}</span>
                ) : (
                  o.icon && <Icon icon={o.icon} />
                )}
                {optionRender?.label ? optionRender.label(o) : o.label}
              </CommandItem>
            ))
          )
        ) : (
          <>{/* <CommandEmpty>{empty ?? defaultEmpty}</CommandEmpty> */}</>
        )}
      </CommandGroup>
    </CommandList>
  );

  const PanelComp = dropdownRender ? dropdownRender(panel) : panel;

  return (
    <CommandRoot filter={filter}>
      <CommandInput
        placeholder={placeholder ?? defaultPlaceholder}
        onValueChange={onSearchChange}
        value={searchValue}
        className={cn(hideSearchInput ? "sr-only" : undefined)}
      />
      {PanelComp}
      {dropdownFooter && (
        <div data-slot="command-footer" className="border-t p-1">
          {dropdownFooter}
        </div>
      )}
    </CommandRoot>
  );
};

export type { CommandProperties as CommandProps };

export { Command };
