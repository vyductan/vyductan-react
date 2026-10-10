import type React from "react";

import { Label } from "@acme/ui/components/label";

import { Checkbox } from "../index";

const App: React.FC = () => {
  return (
    <div className="space-y-2">
      <Label className="flex items-start gap-2 rounded-lg border p-3 hover:bg-accent/50 has-aria-checked:border-primary-600 has-aria-checked:bg-primary-50 dark:has-aria-checked:border-primary-900 dark:has-aria-checked:bg-primary-950">
        <Checkbox
          defaultChecked
          className="data-[state=checked]:border-primary-600 data-[state=checked]:bg-primary-600 data-[state=checked]:text-white dark:data-[state=checked]:border-primary-700 dark:data-[state=checked]:bg-primary-700"
        />
        <div className="grid gap-1.5 font-normal">
          <p className="text-sm leading-none font-medium">Auto Start</p>
          <p className="text-sm text-muted-foreground">
            Starting with your OS.
          </p>
        </div>
      </Label>
      <Label className="flex items-start gap-2 rounded-lg border p-3 hover:bg-accent/50 has-aria-checked:border-primary-600 has-aria-checked:bg-primary-50 dark:has-aria-checked:border-primary-900 dark:has-aria-checked:bg-primary-950">
        <Checkbox className="data-[state=checked]:border-primary-600 data-[state=checked]:bg-primary-600 data-[state=checked]:text-white dark:data-[state=checked]:border-primary-700 dark:data-[state=checked]:bg-primary-700" />
        <div className="grid gap-1.5 font-normal">
          <p className="text-sm leading-none font-medium">Auto update</p>
          <p className="text-sm text-muted-foreground">
            Download and install new version
          </p>
        </div>
      </Label>
    </div>
  );
};

export default App;
