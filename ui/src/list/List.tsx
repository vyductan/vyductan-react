import type { VariantProps } from "class-variance-authority";
import React, { Fragment } from "react";
import { cva } from "class-variance-authority";

import { clsm } from "..";
import { Spin } from "../spin";

const listVariants = cva([""], {
  variants: {
    size: {
      default: [""],
    },
  },
});
export interface ListProps<T> extends VariantProps<typeof listVariants> {
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
}

function List<TRecord extends Record<string, unknown>>({
  // pagination = false as ListProps<any>['pagination'],
  // prefixCls: customizePrefixCls,
  // bordered = false,
  // split = true,
  // className,
  // rootClassName,
  // style,
  // itemLayout,
  // loadMore,
  // grid,
  dataSource = [],
  // size,
  loading = false,
  header,
  footer,
  rowKey,
  renderItem,
  // ...rest
}: ListProps<TRecord>) {
  return (
    <>
      {header && <div>{header}</div>}
      <Spin spinning={loading}>
        {/* {childrenContent} */}
        <ul className={clsm(listVariants({}))}>
          {dataSource.map((item, index) => (
            <Fragment
              key={
                typeof rowKey === "function"
                  ? rowKey(item)
                  : (rowKey
                    ? (item[rowKey] as string)
                    : `list-item-${index}`)
              }
            >
              {renderItem(item, index)}
            </Fragment>
          ))}
        </ul>
      </Spin>
      {footer && <div>{footer}</div>}
    </>
  );
}

export default List;
