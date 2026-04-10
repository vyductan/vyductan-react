import { Button } from "@acme/ui/components/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@acme/ui/components/popover";

const DefaultSpacingDemo = () => {
  return (
    <div className="flex min-h-48 items-start justify-center pt-12">
      <Popover open>
        <PopoverTrigger asChild>
          <Button variant="outline">Open popover</Button>
        </PopoverTrigger>
        <PopoverContent>
          <p className="text-sm">Default sideOffset = 4px</p>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DefaultSpacingDemo;
