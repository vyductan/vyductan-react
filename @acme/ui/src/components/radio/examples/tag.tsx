import type React from "react";
import { useState } from "react";

import type { RadioChangeEvent } from "@acme/ui/components/radio";
import { RadioGroup } from "@acme/ui/components/radio";

const App: React.FC = () => {
  const [value, setValue] = useState("react");

  const onChange = (e: RadioChangeEvent<string>) => {
    setValue(e.target.value);
  };

  return (
    <div className="space-y-6">
      <RadioGroup
        optionType="tag"
        value={value}
        onChange={onChange}
        options={[
          { label: "React", value: "react" },
          { label: "Vue", value: "vue" },
          { label: "Svelte", value: "svelte" },
          { label: "Solid", value: "solid" },
          { label: "Angular", value: "angular" },
        ]}
      />

      <RadioGroup
        optionType="tag"
        defaultValue="green"
        options={[
          { label: "Green", value: "green", color: "green" },
          { label: "Blue", value: "blue", color: "blue" },
          { label: "Purple", value: "purple", color: "purple" },
          { label: "Pink", value: "pink", color: "pink" },
          { label: "Disabled", value: "disabled", color: "teal", disabled: true },
        ]}
      />
    </div>
  );
};

export default App;
