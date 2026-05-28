import type React from "react";

import type { SelectProps } from "@acme/ui/components/select";
import { Select } from "@acme/ui/components/select";

const options: SelectProps["options"] = [];

for (let index = 10; index < 36; index++) {
  options.push({
    value: index.toString(36) + index,
    label: index.toString(36) + index,
  });
}

const App: React.FC = () => (
  <Select
    mode="tags"
    style={{ width: "100%" }}
    placeholder="Tags Mode"
    onChange={(value) => {
      console.log(`selected ${value.join(",")}`);
    }}
    options={options}
  />
);

export default App;
