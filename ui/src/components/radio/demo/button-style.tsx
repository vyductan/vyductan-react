"use client";

import type React from "react";
import { useState } from "react";
import { RadioGroup } from "@/components/ui/radio";

const App: React.FC = () => {
  const [value, setValue] = useState("a");

  const onChange = (e: string) => {
    setValue(e);
    console.log("radio checked", e);
  };

  return (
    <div className="space-y-4">
      <RadioGroup
        options={[
          { label: "Hangzhou", value: "a" },
          { label: "Shanghai", value: "b" },
          { label: "Beijing", value: "c" },
        ]}
        onChange={onChange}
        value={value}
        optionType="button"
        buttonStyle="solid"
      />
    </div>
  );
};

export default App;

