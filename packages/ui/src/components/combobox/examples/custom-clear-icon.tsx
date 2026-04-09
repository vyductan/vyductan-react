import * as React from "react";

import { Combobox } from "@acme/ui/components/combobox";
import type { OptionType } from "@acme/ui/components/select/types";
import { Icon } from "@acme/ui/icons";

const priorityOptions: OptionType<string>[] = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
];

const CustomClearIconDemo = () => {
  const [value, setValue] = React.useState<string | undefined>("medium");

  return (
    <div className="space-y-2">
      <div className="w-[280px]">
        <Combobox<string>
          placeholder="Set priority"
          options={priorityOptions}
          value={value}
          onChange={setValue}
          allowClear={{
            clearIcon: <Icon icon="icon-[lucide--x]" className="size-3.5" />,
          }}
        />
      </div>
      <div data-testid="selected-value">{value ?? "empty"}</div>
    </div>
  );
};

export default CustomClearIconDemo;
