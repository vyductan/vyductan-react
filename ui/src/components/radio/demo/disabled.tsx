import type React from "react";

import { RadioGroup } from "@acme/ui/components/radio";

const App: React.FC = () => {
  return (
    <div className="space-y-4">
      <RadioGroup
        options={[
          { label: "Apple", value: "1" },
          { label: "Pear", value: "2" },
          { label: "Orange", value: "3", disabled: true },
        ]}
        defaultValue="1"
      />
    </div>
  );
};

export default App;
