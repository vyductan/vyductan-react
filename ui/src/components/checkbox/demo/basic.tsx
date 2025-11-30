
import type { CheckboxProps } from "@acme/ui/components/checkbox";
import type React from "react";
import { Checkbox } from "@acme/ui/components/checkbox";

const onChange: CheckboxProps["onChange"] = (e) => {
  console.log(`checked = ${e.target.checked}`);
};

const App: React.FC = () => <Checkbox onChange={onChange}>Checkbox</Checkbox>;

export default App;
