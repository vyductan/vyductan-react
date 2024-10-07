import type { ValueType } from "../form/types";
import type { Option } from "../select/types";
import type { CommandRootProps } from "./_components";
import { Icon } from "../icons";
import {
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
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

  dropdownRender?: (originalNode: React.ReactNode) => React.ReactNode;
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
  dropdownRender,

  filter,
}: CommandProps<T>) => {
  const content = (
    <>
      {/* to allow user set value that not in options */}
      {!options.some((o) => o.value === value) && value !== "" && (
        <CommandItem value={value} checked={true}>
          {value}
        </CommandItem>
      )}
      {options.length > 0 ? (
        optionsRender ? (
          optionsRender(options)
        ) : (
          options.map((item) => (
            <CommandItem
              key={item.value.toString()}
              value={item.value as string}
              onSelect={item.onSelect}
              checked={value === item.value}
            >
              {optionRender?.icon ? (
                <span className="mr-2">{optionRender.icon(item)}</span>
              ) : (
                item.icon && <Icon icon={item.icon} />
              )}
              {optionRender?.label ? optionRender.label(item) : item.label}
            </CommandItem>
          ))
        )
      ) : (
        <>{/* <CommandEmpty>{empty ?? defaultEmpty}</CommandEmpty> */}</>
      )}
    </>
  );

  const ContentComp = dropdownRender ? dropdownRender(content) : content;

  return (
    <CommandRoot filter={filter}>
      <CommandInput
        placeholder={placeholder ?? defaultPlaceholder}
        onValueChange={onSearchChange}
      />
      <CommandList>
        <CommandEmpty>{empty ?? defaultEmpty}</CommandEmpty>
        <CommandGroup className={groupClassName}>{ContentComp}</CommandGroup>
      </CommandList>
    </CommandRoot>
  );
};
