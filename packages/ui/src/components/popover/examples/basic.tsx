import { Button } from "@acme/ui/components/button";
import { Popover } from "@acme/ui/components/popover";

const BasicDemo = () => {
  return (
    <Popover
      trigger="click"
      title="Dimensions"
      description="Set the width and height for the selected layer."
      content={
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
      }
    >
      <Button variant="outline">Open popover</Button>
    </Popover>
  );
};

export default BasicDemo;
