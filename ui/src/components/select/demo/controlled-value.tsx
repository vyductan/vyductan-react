import React from "react";
import { Select } from "@/components/ui/select";

const App: React.FC = () => {
  const [value, setValue] = React.useState<string>("lucy");
  const handleChange = (value: string) => {
    console.log(`selected ${value}`);
    setValue(value);
  };

  return (
    <Select
      defaultValue="lucy"
      value={value}
      style={{ width: 120 }}
      onChange={handleChange}
      options={[
        { value: "jack", label: "Jack" },
        { value: "lucy", label: "Lucy" },
        { value: "Yiminghe", label: "yiminghe" },
        { value: "disabled", label: "Disabled", disabled: true },
      ]}
    />
  );
};

export default App;
