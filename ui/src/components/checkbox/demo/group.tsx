import type { CheckboxOptionType } from "@acme/ui/components/checkbox";
import type React from "react";
import { Checkbox } from "@acme/ui/components/checkbox";

const onChange = (checkedValues: string[]) => {
  console.log("checked =", checkedValues);
};

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
