import * as React from "react";

import type { OptionType } from "@acme/ui/components/select/types";
import { Combobox } from "@acme/ui/components/combobox";

const roleOptions: OptionType<number>[] = [
  { label: "Administrator", value: 1 },
  { label: "Editor", value: 2 },
  { label: "Viewer", value: 3 },
];

const NumericDemo = () => {
  const [value, setValue] = React.useState<number | undefined>(2);

  return (
    <Combobox
      placeholder="Pick a role"
      options={roleOptions}
      value={value}
      onChange={setValue}
    />
  );
};

export default NumericDemo;
