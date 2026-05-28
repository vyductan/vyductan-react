import * as React from "react";

import type { OptionType } from "@acme/ui/components/select/types";
import { Combobox } from "@acme/ui/components/combobox";

const fruitOptions: OptionType<string>[] = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { label: "Cherry", value: "cherry" },
];

const BasicDemo = () => {
  const [value, setValue] = React.useState<string | undefined>("banana");

  return (
    <Combobox
      placeholder="Pick a fruit"
      options={fruitOptions}
      value={value}
      onChange={setValue}
    />
  );
};

export default BasicDemo;
