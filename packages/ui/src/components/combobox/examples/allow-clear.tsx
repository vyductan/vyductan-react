import * as React from "react";

import { Combobox } from "@acme/ui/components/combobox";
import type { OptionType } from "@acme/ui/components/select/types";

const assigneeOptions: OptionType<string>[] = [
  { label: "An", value: "an" },
  { label: "Binh", value: "binh" },
  { label: "Chi", value: "chi" },
];

const AllowClearDemo = () => {
  const [value, setValue] = React.useState<string | undefined>("binh");

  return (
    <div className="space-y-2">
      <div className="w-[280px]">
        <Combobox<string>
          placeholder="Assign owner"
          options={assigneeOptions}
          value={value}
          onChange={setValue}
          allowClear
        />
      </div>
      <div data-testid="selected-value">{value ?? "empty"}</div>
    </div>
  );
};

export default AllowClearDemo;
