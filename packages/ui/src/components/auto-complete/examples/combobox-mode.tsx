import { AutoComplete } from "@acme/ui/components/auto-complete";

const teamOptions = [
  { label: "Design", value: "design" },
  { label: "Engineering", value: "engineering" },
  { label: "Marketing", value: "marketing" },
] as const;

const ComboboxModeDemo = () => (
  <div className="w-[280px]">
    <AutoComplete
      mode="combobox"
      placeholder="Choose a team"
      options={[...teamOptions]}
      className="w-full"
      allowClear
    />
  </div>
);

export default ComboboxModeDemo;
