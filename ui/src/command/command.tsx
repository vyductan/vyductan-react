import { useMergedState } from "rc-util";

import type { ValueType } from "../form/types";
import type { Option } from "../select/types";
import type { CommandRootProps } from "./_components";
import { Divider } from "../divider";
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

export type CommandProps<T extends ValueType> = Omit<
  CommandRootProps,
  "defaultValue" | "value" | "onChange"
> & {
  defaultValue?: T;
  value?: T;
  options: Option<T>[];
  onChange?: (value?: T, option?: Option<T>) => void;

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
      onChange?.(
        value,
        options.find((o) => o.value === value),
      );
    },
  });
  const panel = (
    <CommandList>
      <CommandEmpty>{empty ?? defaultEmpty}</CommandEmpty>
      <CommandGroup className={groupClassName}>
        {/* to allow user set value that not in options */}
        {!!value && !options.some((o) => o.value === value) && value !== "" && (
          <CommandItem checked={true} value={value as string}>
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
                onSelect={(value) => {
                  setValue(value as T);
                }}
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
      {/* <CommandList> */}
      {/*   <CommandEmpty>{empty ?? defaultEmpty}</CommandEmpty> */}
      {/*   <CommandGroup className={groupClassName}>{PanelComp}</CommandGroup> */}
      {/* </CommandList> */}
      {/* <div>XXX</div> */}
      {dropdownFooter && (
        <>
          <Divider className="mb-1 mt-0" />
          <div className="px-1 pb-1">{dropdownFooter}</div>
        </>
      )}
    </CommandRoot>
  );
};
