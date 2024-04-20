import type { TablePaginationConfig } from "antd";

export const genTablePagination = (options: {
  page?: number | string;
  pageSize?: number | string;
}): TablePaginationConfig => {
  const { page, pageSize } = options;
  return {
    current: page ? parseInt(page.toString()) : undefined,
    pageSize: pageSize ? parseInt(pageSize.toString()) : undefined,
  };
};
