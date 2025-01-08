import { cn } from "../..";

type TableToolbarRightProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>;
export const TableToolbarRight = ({
  className,
  ...props
}: TableToolbarRightProps) => {
  return (
    <div className={cn("flex items-center gap-2", className)} {...props} />
  );
};
