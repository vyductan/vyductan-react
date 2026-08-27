import type React from "react";
import { Mail, Search, User } from "lucide-react";

import { Input } from "@acme/ui/components/input";

// Addons sit OUTSIDE the control border, unlike prefix/suffix which render
// inside it — so the two can be combined (last field).
const App: React.FC = () => (
  <div className="flex w-full max-w-sm flex-col gap-4">
    <Input addonBefore="https://" placeholder="mysite" />
    <Input addonAfter=".com" placeholder="mysite" />
    <Input addonBefore="https://" addonAfter=".com" placeholder="mysite" />
    <Input
      addonBefore={<Mail className="size-4" />}
      addonAfter={<Search className="size-4" />}
      placeholder="ReactNode addons"
    />
    <Input
      addonBefore="USD"
      prefix={<User className="size-4" />}
      suffix="/mo"
      placeholder="Addon + prefix + suffix"
    />
  </div>
);

export default App;
