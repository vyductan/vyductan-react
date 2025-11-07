"use client";

import { Switch } from "@/components/ui/switch";

export default function DisabledDemo() {
  return (
    <>
      <Switch disabled defaultChecked />
      <br />
      <Switch disabled />
    </>
  );
}

