import { Button } from "@acme/ui/components/button";
import {
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverRoot,
  PopoverTitle,
  PopoverTrigger,
} from "@acme/ui/components/popover";

const BasicShadcnLikeDemo = () => {
  return (
    <PopoverRoot>
      <PopoverTrigger asChild>
        <Button variant="outline">Open popover</Button>
      </PopoverTrigger>
      <PopoverContent className="space-y-3">
        <PopoverHeader>
          <PopoverTitle>Dimensions</PopoverTitle>
          <PopoverDescription>
            Set the width and height for the selected layer.
          </PopoverDescription>
        </PopoverHeader>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between gap-6">
            <span className="text-muted-foreground">Width</span>
            <span className="font-medium">320px</span>
          </div>
          <div className="flex items-center justify-between gap-6">
            <span className="text-muted-foreground">Height</span>
            <span className="font-medium">180px</span>
          </div>
        </div>
      </PopoverContent>
    </PopoverRoot>
  );
};

export default BasicShadcnLikeDemo;
