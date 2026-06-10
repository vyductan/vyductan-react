import type React from "react";

import { Radio, RadioGroup } from "@acme/ui/components/radio";

const App: React.FC = () => {
  return (
    <RadioGroup defaultValue="auto-start" className="w-full max-w-sm">
      <Radio
        value="auto-start"
        variant="card"
        description="Starting with your OS."
      >
        Auto Start
      </Radio>

      <Radio value="manual-start" variant="card">
        Manual Start
      </Radio>
    </RadioGroup>
  );
};

export default App;
