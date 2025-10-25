import type { SelectProps } from "@/components/ui/select";
import type React from "react";
import { Select } from "@/components/ui/select";

const options: SelectProps["options"] = [];

for (let i = 10; i < 36; i++) {
  options.push({
    value: i.toString(36) + i,
    label: i.toString(36) + i,
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
