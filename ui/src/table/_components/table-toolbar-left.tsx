import { cn } from "../..";

type TableToolbarLeftProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>;
export const TableToolbarLeft = ({
  className,
  ...props
}: TableToolbarLeftProps) => {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col gap-2 md:flex-row md:items-center",
        className,
      )}
      {...props}
    />
  );
};
