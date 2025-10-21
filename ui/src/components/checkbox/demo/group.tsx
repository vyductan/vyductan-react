import type { CheckboxOptionType } from "@/components/ui/checkbox";
import type React from "react";
import { Checkbox } from "@/components/ui/checkbox";

const onChange = (checkedValues: string[]) => {
  console.log("checked =", checkedValues);
};

const plainOptions = ["Apple", "Pear", "Orange"];

const options: CheckboxOptionType<string>[] = [
  { label: "Apple", value: "Apple" },
  { label: "Pear", value: "Pear", className: "text-green-500" },
  { label: "Orange", value: "Orange", className: "text-blue-500" },
];

const optionsWithDisabled: CheckboxOptionType<string>[] = [
  { label: "Apple", value: "Apple" },
  { label: "Pear", value: "Pear", className: "text-green-500" },
  {
    label: "Orange",
    value: "Orange",
    className: "text-blue-500",
    disabled: false,
  },
];

const App: React.FC = () => (
  <>
    <Checkbox.Group
      options={plainOptions}
      defaultValue={["Apple"]}
      onChange={onChange}
    />
    <br />
    <br />
    <Checkbox.Group
      options={options}
      defaultValue={["Pear"]}
      onChange={onChange}
    />
    <br />
    <br />
    <Checkbox.Group
      options={optionsWithDisabled}
      disabled
      defaultValue={["Apple"]}
      onChange={onChange}
    />
  </>
);

export default App;
