import type { PaginationProps as AntdPaginationProps } from "antd";
import { Pagination as AntdPagination } from "antd";
import { useTranslation } from "react-i18next";
import { useLocation, useSearchParams } from "react-router-dom";

import { usePagination } from "~/components/pagination";
import { Link } from "../../components/link";

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
};
const Pagination = ({ showTotal, ...props }: PaginationProps) => {
  const { t } = useTranslation();
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
          ? t("Pagination.total", { total })
          : showTotal?.(total, range)
      }
      showSizeChanger
      {...props}
    />
  );
};

export type { PaginationProps };
export { Pagination, createPageURL };
