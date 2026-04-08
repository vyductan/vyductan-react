import * as React from "react";

import { AutoComplete } from "@acme/ui/components/auto-complete";

const assigneeOptions = [
  { label: "An", value: "an" },
  { label: "Binh", value: "binh" },
  { label: "Chi", value: "chi" },
] as const;

const AllowClearDemo = () => {
  const [value, setValue] = React.useState<string | undefined>("binh");

  return (
    <div className="space-y-2">
      <div className="w-[280px]">
        <AutoComplete
          placeholder="Assign owner"
          options={[...assigneeOptions]}
          value={value}
          onChange={setValue}
          allowClear
          className="w-full"
        />
      </div>
      <div data-testid="selected-value">{value ?? "empty"}</div>
    </div>
  );
};

export default AllowClearDemo;
