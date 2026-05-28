import type React from "react";
import { useState } from "react";

import { Checkbox } from "@acme/ui/components/checkbox";
import { Label } from "@acme/ui/components/label";

const App: React.FC = () => {
  const [checked, setChecked] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <Checkbox
        id="shadcn-controlled"
        checked={checked}
        onCheckedChange={(nextChecked) => {
          setChecked(nextChecked === true);
        }}
      />
      <Label htmlFor="shadcn-controlled">Accept terms and conditions</Label>
    </div>
  );
};

export default App;
