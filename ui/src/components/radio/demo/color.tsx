"use client";

import type React from "react";
import { useState } from "react";
import { RadioGroup } from "@/components/ui/radio";

const App: React.FC = () => {
  const [value1, setValue1] = useState("1");
  const [value2, setValue2] = useState("a");

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Basic Radio with Colors</h4>
        <div className="space-y-4">
          <RadioGroup
            options={[
              { label: "Primary", value: "1", color: "default" },
              { label: "Success", value: "2", color: "success" },
              { label: "Processing", value: "3", color: "primary" },
              { label: "Error", value: "4", color: "red" },
              { label: "Warning", value: "5", color: "amber" },
            ]}
            onChange={setValue1}
            value={value1}
          />
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium">
          Outline Button Style with Colors
        </h4>
        <div className="space-y-4">
          <RadioGroup
            options={[
              { label: "Default", value: "a", color: "default" },
              { label: "Primary", value: "p", color: "primary" },
              { label: "Success", value: "b", color: "success" },
              { label: "Processing", value: "c", color: "primary" },
              { label: "Error", value: "d", color: "red" },
              { label: "Warning", value: "e", color: "amber" },
            ]}
            onChange={setValue2}
            value={value2}
            optionType="button"
          />
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium">Solid Button Style with Colors</h4>
        <div className="space-y-4">
          <RadioGroup
            options={[
              { label: "Default", value: "d", color: "default" },
              { label: "Primary", value: "p", color: "primary" },
              { label: "Blue", value: "f", color: "blue" },
              { label: "Green", value: "g", color: "green" },
              { label: "Purple", value: "h", color: "purple" },
              { label: "Pink", value: "i", color: "pink" },
              { label: "Teal", value: "j", color: "teal" },
            ]}
            defaultValue="d"
            optionType="button"
            buttonStyle="solid"
          />
        </div>
      </div>
    </div>
  );
};

export default App;
