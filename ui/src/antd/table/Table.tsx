import type { TableProps as AntdTableProps } from "antd";
import type { AnyObject } from "antd/es/_util/type";
import type { Reference } from "rc-table";
import type { ForwardedRef } from "react";
import { forwardRef } from "react";
import { Table as AntdTable } from "antd";
import { useLocation, useSearchParams } from "react-router-dom";

import type { PaginationProps } from "../pagination";
import { createPageURL, usePagination } from "../pagination";

type TableProps<TRecord = AnyObject> = Omit<
  AntdTableProps<TRecord>,
  "pagination"
> & {
  pagination?: PaginationProps;
};
const TableInner = <TRecord extends AnyObject = AnyObject>(
  { pagination, ...props }: TableProps<TRecord>,
  ref: React.Ref<Reference>,
) => {
  const { pathname } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { page: current, pageSize } = usePagination();
  const { showTotal, ...restPagination } = pagination ?? {};

  return (
    <AntdTable
      ref={ref}
      pagination={
        pagination
          ? {
              defaultPageSize: pageSize,
              current: current,
              itemRender: (page, type, element) => {
                if (page < 1) page = 1;
                return type === "page" ? (
                  <a href={createPageURL(page, pathname, searchParams)}>
                    {page}
                  </a>
                ) : (
                  <a href={createPageURL(page, pathname, searchParams)}>
                    {element}
                  </a>
                );
              },
              // showTotal: (total, range) =>
              //   typeof showTotal === "boolean"
              //     ? t("Pagination.total", { total })
              //     : showTotal?.(total, range),
              showSizeChanger: true,
              onShowSizeChange: (_, size) => {
                searchParams.set("pageSize", size.toString());
                setSearchParams(searchParams);
              },
              position: ["bottomCenter"],
              ...restPagination,
            }
          : false
      }
      {...props}
    />
  );
};
const Table = forwardRef(TableInner) as <T extends Record<string, unknown>>(
  props: TableProps<T> & { ref?: ForwardedRef<HTMLUListElement> },
) => ReturnType<typeof TableInner>;

export { Table };
