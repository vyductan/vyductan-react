import type React from "react";

import { Checkbox } from "@acme/ui/components/checkbox";
import { Label } from "@acme/ui/components/label";

const App: React.FC = () => {
  return (
    <div className="space-y-2">
      <Label className="hover:bg-accent/50 has-aria-checked:border-primary-600 has-aria-checked:bg-primary-50 dark:has-aria-checked:border-primary-900 dark:has-aria-checked:bg-primary-950 flex items-start gap-2 rounded-lg border p-3">
        <Checkbox
          defaultChecked
          className="data-[state=checked]:border-primary-600 data-[state=checked]:bg-primary-600 dark:data-[state=checked]:border-primary-700 dark:data-[state=checked]:bg-primary-700 data-[state=checked]:text-white"
        />
        <div className="grid gap-1.5 font-normal">
          <p className="text-sm leading-none font-medium">Auto Start</p>
          <p className="text-muted-foreground text-sm">
            Starting with your OS.
          </p>
        </div>
      </Label>
      <Label className="hover:bg-accent/50 has-aria-checked:border-primary-600 has-aria-checked:bg-primary-50 dark:has-aria-checked:border-primary-900 dark:has-aria-checked:bg-primary-950 flex items-start gap-2 rounded-lg border p-3">
        <Checkbox className="data-[state=checked]:border-primary-600 data-[state=checked]:bg-primary-600 dark:data-[state=checked]:border-primary-700 dark:data-[state=checked]:bg-primary-700 data-[state=checked]:text-white" />
        <div className="grid gap-1.5 font-normal">
          <p className="text-sm leading-none font-medium">Auto update</p>
          <p className="text-muted-foreground text-sm">
            Download and install new version
          </p>
        </div>
      </Label>
    </div>
  );
};

export default App;
