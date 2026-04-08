import { AutoComplete } from "@acme/ui/components/auto-complete";

const basicOptions = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { label: "Cherry", value: "cherry" },
] as const;

const BasicDemo = () => (
  <div className="w-[280px]">
    <AutoComplete
      placeholder="Pick a fruit"
      options={[...basicOptions]}
      className="w-full"
    />
  </div>
);

export default BasicDemo;
