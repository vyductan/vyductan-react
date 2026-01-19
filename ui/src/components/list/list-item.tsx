import type { ReactNode } from "react";
import { Children, Fragment } from "react";

import { cn } from "@acme/ui/lib/utils";
import { Item, ItemActions, ItemContent } from "@acme/ui/shadcn/item";

import { useListContext } from "./context";
import { listVariants } from "./list";

interface ListItemProps {
  children: ReactNode;
  actions?: ReactNode[];
  extra?: ReactNode;
}

const ListItem = ({ children, actions, extra }: ListItemProps) => {
  const { itemLayout, size } = useListContext();

  const isItemContainsTextNodeAndNotSingular = () => {
    let result = false;
    Children.forEach(children, (element) => {
      if (typeof element === "string") {
        result = true;
      }
    });

    return result && Children.count(children) > 1;
  };

  const isFlexMode = () => {
    if (itemLayout === "vertical") {
      return !!extra;
    }
    return !isItemContainsTextNodeAndNotSingular();
  };

  return (
    <Item
      asChild
      className={cn(
        "border-b-border rounded-b-none border-b",
        listVariants({ size }),
      )}
    >
      <li>
        <ItemContent className={cn("gap-4", !isFlexMode() && "block")}>
          {children}
          {itemLayout === "vertical" &&
          actions?.length &&
          actions.length > 0 ? (
            <ItemActions>
              {actions.map((action, index) => (
                <Fragment key={index}>{action}</Fragment>
              ))}
            </ItemActions>
          ) : null}
        </ItemContent>
        {(actions ?? extra) && (
          <ItemActions>
            {extra}
            {itemLayout === "horizontal" &&
              actions?.map((action, index) => <div key={index}>{action}</div>)}
          </ItemActions>
        )}
      </li>
    </Item>
  );
};

export { ListItem };
