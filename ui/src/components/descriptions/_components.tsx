import { cn } from "@/lib/utils";

type DescriptionItemContainerProps = React.ComponentProps<"div">;

export const DescriptionsItemContainer = ({
  className,
  ...restProps
}: DescriptionItemContainerProps) => {
  return (
    <div
      data-slot="desciptions-item-container"
      className={cn("flex", className)}
      {...restProps}
    />
  );
};
