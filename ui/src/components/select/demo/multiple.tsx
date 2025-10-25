import type { SelectProps } from "@/components/ui/select";
import type React from "react";
import { Select } from "@/components/ui/select";
import { Space } from "@/components/ui/space";

const options: SelectProps["options"] = [];

for (let i = 10; i < 36; i++) {
  options.push({
    label: i.toString(36) + i,
    value: i.toString(36) + i,
  });
}

const App: React.FC = () => (
  <Space style={{ width: "100%" }} direction="vertical">
    <Select
      mode="multiple"
      allowClear
      style={{ width: "100%" }}
      placeholder="Please select"
      defaultValue={["a10", "c12"]}
      onChange={(value) => {
        console.log(`selected ${value.join(",")}`);
      }}
      options={options}
    />
    <Select
      mode="multiple"
      disabled
      style={{ width: "100%" }}
      placeholder="Please select"
      defaultValue={["a10", "c12"]}
      onChange={(value) => {
        console.log(`selected ${value.join(",")}`);
      }}
      options={options}
    />
  </Space>
);

export default App;
