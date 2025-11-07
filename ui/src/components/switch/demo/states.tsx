"use client";

import { Switch } from "@/components/ui/switch";

export default function StatesDemo() {
  return (
    <>
      <Switch defaultChecked />
      <br />
      <Switch />
      <br />
      <Switch disabled defaultChecked />
      <br />
      <Switch disabled />
    </>
  );
}


