import type { PaginationProps as AntdPaginationProps } from "antd";
import { Pagination as AntdPagination } from "antd";
import { useLocation, useSearchParams } from "react-router-dom";

import { Link } from "../link";
import { usePagination } from "./usePagination";

const createPageURL = (
  pageNumber: number | string,
  pathname: string,
  searchParams: URLSearchParams,
) => {
  const params = new URLSearchParams(searchParams);
  params.set("page", pageNumber.toString());
  return `${pathname}?${params.toString()}`;
};

type PaginationProps = Omit<AntdPaginationProps, "showTotal"> & {
  showTotal?: boolean | AntdPaginationProps["showTotal"];
  locale?: {
    "Pagination.total": string;
  };
};
const Pagination = ({ showTotal, locale, ...props }: PaginationProps) => {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const { page: current, pageSize } = usePagination();

  return (
    <AntdPagination
      className="justify-center"
      defaultPageSize={pageSize}
      defaultCurrent={current}
      itemRender={(page, type, element) =>
        type === "page" ? (
          <Link href={createPageURL(page, pathname, searchParams)}>{page}</Link>
        ) : (
          element
        )
      }
      showTotal={(total, range) =>
        typeof showTotal === "boolean"
          ? locale?.["Pagination.total"]
          : showTotal?.(total, range)
      }
      showSizeChanger
      {...props}
    />
  );
};

export type { PaginationProps };
export { Pagination, createPageURL };
