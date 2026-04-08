import { AutoComplete } from "@acme/ui/components/auto-complete";

const statusOptions = [
  { label: "Backlog", value: "backlog" },
  { label: "In Progress", value: "in-progress" },
] as const;

const DisabledDemo = () => (
  <div className="flex w-[280px] flex-col gap-4">
    <AutoComplete
      placeholder="Disabled"
      options={[...statusOptions]}
      disabled
      className="w-full"
    />
    <AutoComplete
      placeholder="Disabled with value"
      options={[...statusOptions]}
      value="in-progress"
      disabled
      allowClear
      className="w-full"
    />
  </div>
);

export default DisabledDemo;
