import type React from "react";
import { Select } from "@acme/ui/components/select";

const handleChange = (value: string) => {
  console.log(`selected ${value}`);
};

const App: React.FC = () => (
  <Select
    defaultValue="lucy"
    style={{ width: 120 }}
    onChange={handleChange}
    options={[
      { value: "jack", label: "Jack", color: "red" },
      { value: "lucy", label: "Lucy", color: "green" },
      { value: "Yiminghe", label: "yiminghe", color: "blue" },
      { value: "disabled", label: "Disabled", disabled: true, color: "gray" },
    ]}
  />
);

export default App;
