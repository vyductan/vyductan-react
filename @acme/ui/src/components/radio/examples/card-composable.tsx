import type React from "react";

import { Label } from "@acme/ui/components/label";

import { RadioGroup, RadioGroupItem } from "../index";

const App: React.FC = () => {
  return (
    <RadioGroup defaultValue="auto-start" className="w-full max-w-sm">
      <Label className="hover:bg-accent/50 has-aria-checked:border-primary-600 has-aria-checked:bg-primary-50 dark:has-aria-checked:border-primary-900 dark:has-aria-checked:bg-primary-950 flex items-start gap-2 rounded-lg border p-3">
        <RadioGroupItem
          value="auto-start"
          className="data-[state=checked]:border-primary-600 dark:data-[state=checked]:border-primary-700"
        />
        <div className="grid gap-1.5 font-normal">
          <p className="text-sm leading-none font-medium">Auto Start</p>
          <p className="text-muted-foreground text-sm">
            Starting with your OS.
          </p>
        </div>
      </Label>
      <Label className="hover:bg-accent/50 has-aria-checked:border-primary-600 has-aria-checked:bg-primary-50 dark:has-aria-checked:border-primary-900 dark:has-aria-checked:bg-primary-950 flex items-start gap-2 rounded-lg border p-3">
        <RadioGroupItem
          value="manual-start"
          className="data-[state=checked]:border-primary-600 dark:data-[state=checked]:border-primary-700"
        />
        <div className="grid gap-1.5 font-normal">
          <p className="text-sm leading-none font-medium">Manual Start</p>
          <p className="text-muted-foreground text-sm">
            Start the app yourself when needed.
          </p>
        </div>
      </Label>
    </RadioGroup>
  );
};

export default App;
