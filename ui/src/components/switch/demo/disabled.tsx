import { Switch } from "@acme/ui/components/switch";

export default function DisabledDemo() {
  return (
    <>
      <Switch disabled defaultChecked />
      <br />
      <Switch disabled />
    </>
  );
}
