import { AutoComplete } from "@acme/ui/components/auto-complete";

// Each option carries a rich `label` (shown in the dropdown list) and a short
// `short` field. `optionLabelProp="short"` tells AutoComplete to display the
// short value in the trigger once an option is selected.
const countryOptions = [
  { value: "us", label: "United States of America", short: "USA" },
  { value: "vn", label: "Socialist Republic of Vietnam", short: "Vietnam" },
  { value: "jp", label: "Japan (日本)", short: "Japan" },
];

const OptionLabelPropDemo = () => (
  <div className="w-[340px]">
    <AutoComplete
      placeholder="Select a country"
      options={countryOptions}
      // Trigger shows `short`; dropdown keeps the full `label`.
      optionLabelProp="short"
      defaultValue="us"
    />
  </div>
);

export default OptionLabelPropDemo;
