import { cn } from "@acme/ui/lib/utils";
import { DropdownMenuItem as ShadcnDropdownMenuItem } from "@acme/ui/shadcn/dropdown-menu";

const DropdownMenuItem = ({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof ShadcnDropdownMenuItem> & {
  inset?: boolean;
  variant?: "default" | "destructive";
}) => {
  return (
    <ShadcnDropdownMenuItem
      className={cn(
        "text-foreground [&_a]:text-foreground",
        "data-[variant=destructive]:*:[span[role='img']]:text-destructive! [&_span[role='img']:not([class*='text-'])]:text-muted-foreground", // same [&_svg:not([class*='text-'])]:text-muted-foreground
        className,
      )}
      inset={inset}
      variant={variant}
      {...props}
    />
  );
};

export { DropdownMenuItem };
export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@acme/ui/shadcn/dropdown-menu";
