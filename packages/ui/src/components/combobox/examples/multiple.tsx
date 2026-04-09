import * as React from "react";

import { Combobox } from "@acme/ui/components/combobox";
import type { OptionType } from "@acme/ui/components/select/types";

const teamOptions: OptionType<string>[] = [
  { label: "An", value: "an" },
  { label: "Binh", value: "binh" },
  { label: "Chi", value: "chi" },
  { label: "Dung", value: "dung" },
];

const MultipleDemo = () => {
  const [value, setValue] = React.useState<string[]>(["an", "chi"]);

  return (
    <Combobox
      mode="multiple"
      placeholder="Select teammates"
      options={teamOptions}
      value={value}
      onChange={(nextValue: string[] | undefined) => setValue(nextValue ?? [])}
      allowClear
    />
  );
};

export default MultipleDemo;
