import { Icon } from "@vyductan/icons";
import { clsm } from "@vyductan/utils";

import type { SelectOption } from "../select/types";
import {
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandRoot,
} from "./components";

export type CommandProps = {
  options: (SelectOption & {
    onSelect: (currentValue: string) => void;
  })[];

  value?: string;

  empty?: React.ReactNode;
  placeholder?: string;
};

const defaultPlaceholder = "Search...";
const defaultEmpty = "No data";

export const Command = ({
  options,
  value,
  empty,
  placeholder,
}: CommandProps) => {
  return (
    <CommandRoot>
      <CommandInput placeholder={placeholder ?? defaultPlaceholder} />
      <CommandEmpty>{empty ?? defaultEmpty}</CommandEmpty>
      {options.length > 0 && (
        <CommandGroup>
          {options.map((item) => (
            <CommandItem
              key={item.value}
              value={item.value}
              onSelect={item.onSelect}
            >
              <Icon
                icon="mingcute:check-fill"
                className={clsm(
                  "mr-2 size-4",
                  value === item.value ? "opacity-100" : "opacity-0",
                )}
              />
              {item.label}
            </CommandItem>
          ))}
        </CommandGroup>
      )}
    </CommandRoot>
  );
};
