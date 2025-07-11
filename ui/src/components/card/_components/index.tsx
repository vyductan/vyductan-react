import { useContext } from "react";

import type { SizeType } from "@acme/ui/types";
import { cn } from "@acme/ui/lib/utils";
import {
  CardAction as ShadcnCardAction,
  CardContent as ShadcnCardContent,
  CardFooter as ShadcnCardFooter,
  CardHeader as ShadcnCardHeader,
  CardRoot as ShadcnCardRoot,
  CardTitle as ShadcnCardTitle,
} from "@acme/ui/shadcn/card";

import { CardContext } from "../context";

type CardRootProps = React.ComponentProps<typeof ShadcnCardRoot> & {
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
      className={cn(
        size === "small" && "gap-3 py-3",
        bordered ? "" : "border-none",
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
      className={cn(size === "small" && "px-3", className)}
      {...props}
    />
  );
};

const CardTitle = ({
  className,
  ...props
}: React.ComponentProps<typeof ShadcnCardTitle>) => {
  return (
    <ShadcnCardTitle
      className={cn(
        "flex-1", // fix if not has extra the title width not full
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
  return (
    <ShadcnCardAction
      className={cn(
        "row-span-1", // title and extra should same height
        className,
      )}
      {...props}
    />
  );
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
      className={cn(size === "small" && "px-3", className)}
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
      className={cn(size === "small" && "px-3", className)}
      {...props}
    />
  );
};

export type { CardRootProps };

export { CardRoot, CardHeader, CardTitle, CardAction, CardContent, CardFooter };

export { CardDescription } from "@acme/ui/shadcn/card";
