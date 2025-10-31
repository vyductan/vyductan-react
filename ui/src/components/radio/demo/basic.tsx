"use client";

import type React from "react";
import { useState } from "react";
import { RadioGroup } from "@/components/ui/radio";

const App: React.FC = () => {
  const [value, setValue] = useState("1");

  const onChange = (e: string) => {
    setValue(e);
    console.log("radio checked", e);
  };

  return (
    <RadioGroup
      options={[
        { label: "Apple", value: "1" },
        { label: "Pear", value: "2" },
        { label: "Orange", value: "3" },
      ]}
      onChange={onChange}
      value={value}
    />
  );
};

export default App;

