import { cn } from "@acme/ui/lib/utils";

const FormItemControlInput = ({
  className,
  ...props
}: React.ComponentProps<"div">) => {
  return (
    <div
      data-slot="form-item-control-input"
      className={cn("min-h-control", className)}
      {...props}
    />
  );
};

export { FormItemControlInput };
