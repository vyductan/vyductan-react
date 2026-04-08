import * as React from "react";

import { AutoComplete } from "@acme/ui/components/auto-complete";

const numericOptions = [
  { label: "Administrator", value: 1 },
  { label: "Editor", value: 2 },
  { label: "Viewer", value: 3 },
] as const;

const NumericValuesDemo = () => {
  const [value, setValue] = React.useState<number | undefined>(2);

  return (
    <div className="space-y-2">
      <div className="w-[320px]">
        <AutoComplete<number>
          placeholder="Choose a role"
          options={[...numericOptions]}
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

export default NumericValuesDemo;
