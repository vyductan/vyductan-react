import { useMergedState } from "rc-util";

import type { ValueType } from "../form/types";
import type { Option } from "../select/types";
import type { CommandRootProps } from "./_components";
import { cn } from "..";
import { Divider } from "../divider";
import { Icon } from "../icons";
import { selectColors } from "../select/colors";
import {
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandRoot,
} from "./_components";
import { defaultEmpty, defaultPlaceholder } from "./config";

type CommandSingleValue<T extends ValueType = string> = {
  mode?: never;
  value?: T;
  defaultValue?: T;
  onChange?: (value?: T, option?: Option<T>) => void;
};
type CommandMultipleValue<T extends ValueType = string> = {
  mode: "multiple";
  value?: T[];
  defaultValue?: T[];
  onChange?: (value: T[], options?: Option<T>[]) => void;
};
export type CommandProps<T extends ValueType = string> = Omit<
  CommandRootProps,
  "defaultValue" | "value" | "onChange"
> &
  (CommandSingleValue<T> | CommandMultipleValue<T>) & {
    options: Option<T>[];

    empty?: React.ReactNode;
    placeholder?: string;

    onSearchChange?: (search: string) => void;

    groupClassName?: string;
    optionRender?: {
      checked?: boolean;
      icon?: (option: Option<T>) => React.ReactNode;
      label?: (option: Option<T>) => React.ReactNode;
    };
    optionsRender?: (options: Option<T>[]) => React.ReactNode;

    dropdownRender?: (originalNode: React.ReactNode) => React.ReactNode;
    dropdownFooter?: React.ReactNode;
  };

export const Command = <T extends ValueType = string>({
  mode,
  options,
  defaultValue: defaultValueProp,
  value: valueProp,
  empty,
  placeholder,
  onSearchChange,

  groupClassName,
  optionRender,
  optionsRender,
  dropdownRender,
  onChange,

  filter,

  dropdownFooter,
}: CommandProps<T>) => {
  const [value, setValue] = useMergedState(defaultValueProp, {
    value: valueProp,
    onChange: (value) => {
      if (mode === undefined && !Array.isArray(value)) {
        onChange?.(
          value,
          options.find((o) => o.value === value),
        );
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
  const panel = (
    <CommandList>
      <CommandEmpty>{empty ?? defaultEmpty}</CommandEmpty>
      <CommandGroup className={groupClassName}>
        {/* to allow user set value that not in options */}
        {!Array.isArray(value) &&
          !!value &&
          !options.some((o) => o.value === value) &&
          value !== "" && (
            <CommandItem checked={true} value={value as string}>
              {value}
            </CommandItem>
          )}
        {options.length > 0 ? (
          optionsRender ? (
            optionsRender(options)
          ) : (
            options.map((o) => (
              <CommandItem
                key={o.value.toString()}
                value={o.value as string}
                onSelect={(selected) => {
                  if (mode === "multiple" && Array.isArray(value)) {
                    if (value.includes(o.value)) {
                      setValue(value.filter((x) => x !== o.value));
                    } else {
                      setValue([...value, selected as T]);
                    }
                  } else {
                    setValue(selected as T);
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
                  o.color ? selectColors[o.color] : "",
                  "bg-transparent",
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
      />
      {PanelComp}
      {dropdownFooter && (
        <>
          <Divider className="mb-1 mt-0" />
          <div className="px-1 pb-1">{dropdownFooter}</div>
        </>
      )}
    </CommandRoot>
  );
};
