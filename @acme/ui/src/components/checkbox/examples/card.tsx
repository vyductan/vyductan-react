import type React from "react";

import { Checkbox } from "@acme/ui/components/checkbox";

const App: React.FC = () => {
  return (
    <div className="w-full max-w-sm">
      <Checkbox defaultChecked variant="card">
        <div className="grid gap-1.5 font-normal">
          <p className="text-sm leading-none font-medium">Auto Start</p>
          <p className="text-muted-foreground text-sm">Starting with your OS.</p>
        </div>
      </Checkbox>
    </div>
  );
};

export default App;
