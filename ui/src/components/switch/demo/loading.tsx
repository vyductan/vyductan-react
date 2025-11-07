"use client";

import { Switch } from "@/components/ui/switch";

export default function LoadingDemo() {
  return (
    <>
      <Switch loading defaultChecked />
      <br />
      <Switch loading />
      <br />
      <Switch loading size="small" defaultChecked />
    </>
  );
}

