import { useMergedState } from "rc-util";

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
  defaultValue?: T;
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
  defaultValue: defaultValueProp,
  value: valueProp,
  empty,
  placeholder,
  onSearchChange,

  groupClassName,
  optionRender,
  optionsRender,
  dropdownRender,

  filter,
}: CommandProps<T>) => {
  const [value] = useMergedState(defaultValueProp, {
    value: valueProp,
  });
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
    <CommandRoot value={value} filter={filter}>
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
