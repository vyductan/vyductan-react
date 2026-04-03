import type React from "react";
import { Fragment } from "react";
import { cva } from "class-variance-authority";

import { cn } from "@acme/ui/lib/utils";

import type { SizeType } from "../config-provider/size-context";
import type { PaginationProps } from "../pagination";
import { Spin } from "../spin";
import { ListProvider } from "./context";
import { ListItem } from "./list-item";
import { ListItemMeta } from "./list-item-meta";

export const listVariants = cva([""], {
  variants: {
    size: {
      small: ["py-2 px-4"],
      middle: ["py-3 px-6"],
      large: ["py-4 px-6"],
    },
  },
});
interface ListProps<T> {
  itemLayout?: "horizontal" | "vertical";
  size?: SizeType;
  bordered?: boolean;
  className?: string;
  // rootClassName?: string;
  style?: React.CSSProperties;
  dataSource?: T[];
  extra?: React.ReactNode;
  // grid?: ListGridType;
  // id?: string;
  // itemLayout?: ListItemLayout;
  loading?: boolean;
  loadMore?: React.ReactNode;
  // pagination?: PaginationConfig | false;
  // prefixCls?: string;
  rowKey?: keyof T | ((item: T) => React.Key);
  split?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  // locale?: ListLocale;
  renderItem: (item: T, index: number) => React.ReactNode;

  pagination?:
    | (PaginationProps & {
        position?: "top" | "bottom" | "both";
      })
    | false;
}

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint, @typescript-eslint/no-explicit-any
const List = <T extends any>({
  itemLayout = "horizontal",
  bordered = false,
  // pagination = false as ListProps<any>['pagination'],
  // prefixCls: customizePrefixCls,
  // split = true,
  // className,
  // rootClassName,
  // style,
  // loadMore,
  // grid,
  dataSource = [],
  size = "middle",
  loading = false,
  header,
  footer,
  rowKey,
  renderItem,
  // ...rest
}: ListProps<T>) => {
  return (
    <ListProvider itemLayout={itemLayout} size={size}>
      <div className={cn(bordered && "rounded-md border")}>
        {header && (
          <div
            className={cn(
              "text-sm",
              bordered && "border-b",
              listVariants({ size }),
            )}
          >
            {header}
          </div>
        )}
        <Spin spinning={loading}>
          <ul>
            {dataSource.map((item, index) => (
              <Fragment
                key={
                  typeof rowKey === "function"
                    ? rowKey(item)
                    : rowKey
                      ? (item[rowKey] as string)
                      : `list-item-${index}`
                }
              >
                {renderItem(item, index)}
              </Fragment>
            ))}
          </ul>
        </Spin>
        {footer && (
          <div className={cn("text-sm", listVariants({ size }))}>{footer}</div>
        )}
      </div>
    </ListProvider>
  );
};

// Add ListItem and Meta as static properties to List
const ListWithItem = List as typeof List & {
  Item: typeof ListItem & {
    Meta: typeof ListItemMeta;
  };
};

ListWithItem.Item = ListItem as typeof ListItem & {
  Meta: typeof ListItemMeta;
};

ListWithItem.Item.Meta = ListItemMeta;

export type { ListProps };
export { ListWithItem as List };
