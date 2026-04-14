import type React from "react";

import { Checkbox } from "@acme/ui/components/checkbox";

const App: React.FC = () => {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <Checkbox defaultChecked variant="card">
        <div className="mt-1 grid gap-1.5 font-normal">
          <p className="text-sm leading-none font-medium">Auto Start</p>
          <p className="text-muted-foreground text-sm">
            Starting with your OS.
          </p>
        </div>
      </Checkbox>

      <Checkbox defaultChecked variant="card">
        Active
      </Checkbox>
    </div>
  );
};

export default App;
