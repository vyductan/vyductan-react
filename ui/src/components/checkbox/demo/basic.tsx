"use client";

import type { CheckboxProps } from "@/components/ui/checkbox";
import type React from "react";
import { Checkbox } from "@/components/ui/checkbox";

const onChange: CheckboxProps["onChange"] = (e) => {
  console.log(`checked = ${e.target.checked}`);
};

const App: React.FC = () => <Checkbox onChange={onChange}>Checkbox</Checkbox>;

export default App;
