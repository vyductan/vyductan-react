import { Switch } from "@acme/ui/components/switch";

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
