
import { useState } from "react";
import { Switch } from "@acme/ui/components/switch";

export default function ControlledDemo() {
  const [checked, setChecked] = useState(false);

  const handleChange = (checked: boolean) => {
    setChecked(checked);
  };

  return <Switch checked={checked} onChange={handleChange} />;
}
