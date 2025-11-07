"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";

export default function ControlledDemo() {
  const [checked, setChecked] = useState(false);

  const handleChange = (checked: boolean) => {
    setChecked(checked);
  };

  return <Switch checked={checked} onChange={handleChange} />;
}


