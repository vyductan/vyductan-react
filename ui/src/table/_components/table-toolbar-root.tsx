import { cn } from "../..";

type TableToolbarRootProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>;
export const TableToolbarRoot = ({
  className,
  ...props
}: TableToolbarRootProps) => {
  return (
    <div
      className={cn(
        "flex w-full flex-col gap-2 overflow-auto py-1 md:flex-row md:items-center md:justify-between",
        className,
      )}
      {...props}
    />
  );
};
