import { Button } from "@acme/ui/components/button";
import { AutoComplete } from "@acme/ui/components/auto-complete";

const serviceOptions = [
  { label: "Email", value: "email" },
  { label: "Push", value: "push" },
  { label: "SMS", value: "sms" },
] as const;

const DropdownCustomizationDemo = () => (
  <div className="w-[340px]">
    <AutoComplete
      placeholder="Select a service"
      options={[...serviceOptions]}
      dropdownFooter={
        <div className="border-border border-t p-2">
          <Button variant="text" className="w-full justify-start px-2">
            Create service
          </Button>
        </div>
      }
      className="w-full"
    />
  </div>
);

export default DropdownCustomizationDemo;
