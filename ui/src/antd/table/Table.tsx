import type { TableProps as AntdTableProps } from "antd";
import type { AnyObject } from "antd/es/_util/type";
import type { Reference } from "rc-table";
import type { ForwardedRef } from "react";
import { forwardRef } from "react";
import { Table as AntdTable } from "antd";
import { useTranslation } from "react-i18next";
import { useLocation, useSearchParams } from "react-router-dom";

import type { PaginationProps } from "../pagination";
import { Link } from "~/components/link";
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
  const { t } = useTranslation();
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
              defaultCurrent: current,
              itemRender: (page, type, element) =>
                type === "page" ? (
                  <Link href={createPageURL(page, pathname, searchParams)}>
                    {page}
                  </Link>
                ) : (
                  element
                ),
              showTotal: (total, range) =>
                typeof showTotal === "boolean"
                  ? t("Pagination.total", { total })
                  : showTotal?.(total, range),
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
