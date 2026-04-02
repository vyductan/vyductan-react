import { useContext } from "react";

import { cn } from "@acme/ui/lib/utils";
import {
  CardAction as ShadcnCardAction,
  CardContent as ShadcnCardContent,
  CardFooter as ShadcnCardFooter,
  CardHeader as ShadcnCardHeader,
  Card as ShadcnCardRoot,
  CardTitle as ShadcnCardTitle,
} from "@acme/ui/shadcn/card";

import type { SizeType } from "../../config-provider/size-context";
import { CardContext } from "../context";

type CardRootProps = Omit<
  React.ComponentProps<typeof ShadcnCardRoot>,
  "size"
> & {
  size?: SizeType;
  bordered?: boolean;
};
const CardRoot = ({
  size,
  bordered = true,
  className,
  ...props
}: CardRootProps) => {
  return (
    <ShadcnCardRoot
      data-size={size}
      className={cn(
        "group/card bg-card text-card-foreground ring-foreground/10 gap-4 overflow-hidden rounded-xl py-4 text-sm ring-1 has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl",
        size === "small" && "gap-3 py-3 has-data-[slot=card-footer]:pb-0",
        bordered ? "" : "border-none shadow-none ring-0",
        className,
      )}
      {...props}
    />
  );
};

const CardHeader = ({
  size: sizeProp,
  className,
  ...props
}: React.ComponentProps<typeof ShadcnCardHeader> & {
  size?: SizeType;
}) => {
  const context = useContext(CardContext);
  const size = context.size ?? sizeProp;
  return (
    <ShadcnCardHeader
      className={cn(
        "group/card-header gap-1 rounded-t-xl px-4 has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-4",
        size === "small" && "px-3 [.border-b]:pb-3",
        className,
      )}
      {...props}
    />
  );
};

const CardTitle = ({
  size: sizeProp,
  className,
  ...props
}: React.ComponentProps<typeof ShadcnCardTitle> & {
  size?: SizeType;
}) => {
  const context = useContext(CardContext);
  const size = context.size ?? sizeProp;
  return (
    <ShadcnCardTitle
      className={cn(
        "text-base leading-snug font-medium",
        size === "small" && "text-sm",
        className,
      )}
      {...props}
    />
  );
};

const CardAction = ({
  className,
  ...props
}: React.ComponentProps<typeof ShadcnCardAction>) => {
  return <ShadcnCardAction className={className} {...props} />;
};

const CardContent = ({
  size: sizeProp,
  className,
  ...props
}: React.ComponentProps<typeof ShadcnCardContent> & {
  size?: SizeType;
}) => {
  const context = useContext(CardContext);
  const size = context.size ?? sizeProp;
  return (
    <ShadcnCardContent
      className={cn("px-4", size === "small" && "px-3", className)}
      {...props}
    />
  );
};

const CardFooter = ({
  size: sizeProp,
  className,
  ...props
}: React.ComponentProps<typeof ShadcnCardFooter> & {
  size?: SizeType;
}) => {
  const context = useContext(CardContext);
  const size = context.size ?? sizeProp;
  return (
    <ShadcnCardFooter
      className={cn(
        "bg-muted/50 rounded-b-xl border-t p-4 group-data-[size=sm]/card:p-3",
        size === "small" && "p-3",
        className,
      )}
      {...props}
    />
  );
};

export type { CardRootProps };

export { CardRoot, CardHeader, CardTitle, CardAction, CardContent, CardFooter };

export { CardDescription } from "@acme/ui/shadcn/card";
