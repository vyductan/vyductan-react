import type React from "react";

import { Input } from "@acme/ui/components/input";

// With addons the size/variant classes move from the input to the wrapper, so
// every size and status has to be checked here — this is where addon styling
// breaks first.
const App: React.FC = () => (
  <div className="flex w-full max-w-sm flex-col gap-4">
    <Input
      size="small"
      addonBefore="https://"
      addonAfter=".com"
      placeholder="Small"
    />
    <Input
      size="middle"
      addonBefore="https://"
      addonAfter=".com"
      placeholder="Middle"
    />
    <Input
      size="large"
      addonBefore="https://"
      addonAfter=".com"
      placeholder="Large"
    />
    <Input
      disabled
      addonBefore="https://"
      addonAfter=".com"
      placeholder="Disabled"
    />
    <Input
      status="error"
      addonBefore="https://"
      addonAfter=".com"
      placeholder="Error"
    />
  </div>
);

export default App;
