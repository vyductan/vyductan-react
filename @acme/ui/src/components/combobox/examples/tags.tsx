import * as React from "react";

import type { OptionType } from "@acme/ui/components/select/types";
import { Combobox } from "@acme/ui/components/combobox";

const topicOptions: OptionType<string>[] = [
  { label: "Design", value: "design" },
  { label: "Engineering", value: "engineering" },
  { label: "Product", value: "product" },
];

const TagsDemo = () => {
  const [value, setValue] = React.useState<string[]>(["design", "product"]);

  return (
    <div className="space-y-2">
      <div className="w-[320px]">
        <Combobox<string>
          mode="tags"
          placeholder="Add topics"
          options={topicOptions}
          value={value}
          onChange={(nextValue) => setValue(nextValue ?? [])}
          allowClear
        />
      </div>
      <div data-testid="selected-value">{value.join(", ") || "empty"}</div>
    </div>
  );
};

export default TagsDemo;
