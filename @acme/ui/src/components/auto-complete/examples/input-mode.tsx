import { AutoComplete } from "@acme/ui/components/auto-complete";

const cityOptions = [
  { label: "Ho Chi Minh City", value: "hcm" },
  { label: "Ha Noi", value: "hn" },
  { label: "Da Nang", value: "dn" },
] as const;

const InputModeDemo = () => (
  <div className="w-[320px]">
    <AutoComplete
      mode="input"
      placeholder="Search a city"
      searchPlaceholder="Type to filter"
      options={[...cityOptions]}
    />
  </div>
);

export default InputModeDemo;
