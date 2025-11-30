
import { Switch } from "@acme/ui/components/switch";

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
