import type { TableProps as AntdTableProps } from "antd";
import type { AnyObject } from "antd/es/_util/type";
import type { Reference } from "rc-table";
import type { ForwardedRef } from "react";
import { forwardRef } from "react";
import { Table as AntdTable } from "antd";
import { useTranslation } from "react-i18next";

import type { TranslationFn } from "../../_util/translation";
import type { PaginationProps } from "../pagination";
import { t as defaultT } from "../../_util/translation";
import { Link } from "../../link";
import { tableLocale_en } from "../../table/locale/en_US";
import { createPageURL, usePagination } from "../pagination";

type TableProps<TRecord = AnyObject> = Omit<
  AntdTableProps<TRecord>,
  "pagination"
> & {
  pagination?: PaginationProps;
  t?: TranslationFn;
};
const TableInner = <TRecord extends AnyObject = AnyObject>(
  {
    pagination,
    locale = tableLocale_en,
    t = defaultT,
    ...props
  }: TableProps<TRecord>,
  ref: React.Ref<Reference>,
) => {
  // const { page: current, pageSize } = usePagination();
  const { current, pageSize, showTotal, ...restPagination } = pagination ?? {};

  return (
    <AntdTable
      ref={ref}
      pagination={
        pagination
          ? {
              defaultPageSize: pageSize,
              current: current,
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
                  ? t("components.Pagination.total", { total })
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
