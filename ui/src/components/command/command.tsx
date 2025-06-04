import type { XOR } from "ts-xor";
import { useMergedState } from "@rc-component/util";

import { tagColors } from "@acme/ui/components/tag";
import { cn } from "@acme/ui/lib/utils";

import type { Option } from "../select/types";
import type { CommandRootProps } from "./_components";
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

type ShadcnCommandProps = React.ComponentProps<typeof CommandRoot>;

type CommandValueType = string | number;

type CommandSingleValue<TValue extends CommandValueType = string> = {
  mode?: "default";
  value?: TValue;
  defaultValue?: TValue;
  onChange?: (value?: TValue, option?: Option<TValue>) => void;
};
type CommandMultipleValue<TValue extends CommandValueType = string> = {
  mode: "multiple" | "tags";
  value?: TValue[];
  defaultValue?: TValue[];
  onChange?: (value: TValue[], options?: Option<TValue>[]) => void;
};

export type OwnCommandProps<TValue extends CommandValueType = string> = Omit<
  CommandRootProps,
  "defaultValue" | "value" | "onChange"
> &
  (CommandSingleValue<TValue> | CommandMultipleValue<TValue>) & {
    options: Option<TValue>[];

    empty?: React.ReactNode;
    placeholder?: string;

    onSearchChange?: (search: string) => void;

    groupClassName?: string;
    optionRender?: {
      checked?: boolean;
      icon?: (option: Option<TValue>) => React.ReactNode;
      label?: (option: Option<TValue>) => React.ReactNode;
    };
    optionsRender?: (options: Option<TValue>[]) => React.ReactNode;

    dropdownRender?: (originalNode: React.ReactNode) => React.ReactNode;
    dropdownFooter?: React.ReactNode;
  };

type CommandProps<TValue extends CommandValueType = string> = XOR<
  OwnCommandProps<TValue>,
  ShadcnCommandProps
>;

const Command = <TValue extends CommandValueType = string>(
  props: CommandProps<TValue>,
) => {
  const [value, setValue] = useMergedState(props.defaultValue, {
    value: props.value,
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

  const isShadcnCommand = !props.options;
  if (isShadcnCommand) {
    return (
      <CommandRoot
        {...props}
        defaultValue={props.defaultValue?.toString()}
        value={props.value?.toString()}
        onChange={props.onChange}
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

    groupClassName,
    optionRender,
    optionsRender,
    dropdownRender,
    onChange,

    filter,

    dropdownFooter,
  } = props;
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

export type { CommandProps };

export { Command };
