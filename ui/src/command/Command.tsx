import { Icon } from "@vyductan/icons";
import { clsm } from "@vyductan/utils";

import type { SelectOption } from "../select/types";
import type { CommandRootProps } from "./components";
import {
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandRoot,
} from "./components";
import { defaultEmpty, defaultPlaceholder } from "./config";

export type CommandProps<T> = CommandRootProps & {
  value?: T;
  options: (SelectOption<T> & {
    onSelect: (currentValue: string) => void;
  })[];

  empty?: React.ReactNode;
  placeholder?: string;

  onSearchChange?: (search: string) => void;

  groupClassName?: string;
  optionRender?: {
    checked?: boolean;
    icon?: (option: SelectOption<T>) => React.ReactNode;
    label?: (option: SelectOption<T>) => React.ReactNode;
  };
  optionsRender?: (options: SelectOption<T>[]) => React.ReactNode;
};

export const Command = <T extends string>({
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
                  key={item.value}
                  value={item.value}
                  onSelect={item.onSelect}
                >
                  {!optionRender ||
                    (optionRender?.checked && (
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
