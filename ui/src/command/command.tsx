import { clsm } from "@acme/ui";

import type { ValueType } from "../form/types";
import type { Option } from "../select/types";
import type { CommandRootProps } from "./_components";
import { Icon } from "../icons";
import {
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandRoot,
} from "./_components";
import { defaultEmpty, defaultPlaceholder } from "./config";

export type CommandProps<T extends ValueType> = CommandRootProps & {
  value?: T;
  options: (Option<T> & {
    onSelect: (currentValue: string) => void;
  })[];

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
};

export const Command = <T extends ValueType = string>({
  options,
  value,
  empty,
  placeholder,
  onSearchChange,

  groupClassName,
  optionRender,
  optionsRender,
}: CommandProps<T>) => {
  return (
    <CommandRoot>
      <CommandInput
        placeholder={placeholder ?? defaultPlaceholder}
        onValueChange={onSearchChange}
      />
      <CommandEmpty>{empty ?? defaultEmpty}</CommandEmpty>
      {options.length > 0 && (
        <CommandGroup className={groupClassName}>
          {optionsRender
            ? optionsRender(options)
            : options.map((item) => (
                <CommandItem
                  key={item.value.toString()}
                  value={item.value as string}
                  onSelect={item.onSelect}
                >
                  {!optionRender ||
                    (optionRender.checked && (
                      <Icon
                        icon="mingcute:check-fill"
                        className={clsm(
                          "mr-2 size-4",
                          value === item.value ? "opacity-100" : "opacity-0",
                        )}
                      />
                    ))}
                  {optionRender?.icon ? (
                    <span className="mr-2">{optionRender.icon(item)}</span>
                  ) : (
                    item.icon && <Icon icon={item.icon} />
                  )}
                  {optionRender?.label ? optionRender.label(item) : item.label}
                </CommandItem>
              ))}
        </CommandGroup>
      )}
    </CommandRoot>
  );
};
