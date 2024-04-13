import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

export const usePagination = (opts?: { page?: number; pageSize?: number }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = searchParams.get("page");
  const pageSize = searchParams.get("pageSize");

  useEffect(() => {
    if (
      opts?.page &&
      !searchParams.has("page") &&
      searchParams.get("page") !== String(opts.page)
    ) {
      searchParams.set("page", String(opts.page));
      setSearchParams(searchParams);
    }
    if (
      opts?.pageSize &&
      !searchParams.has("pageSize") &&
      searchParams.get("pageSize") !== String(opts.pageSize)
    ) {
      searchParams.set("pageSize", String(opts.pageSize));
      setSearchParams(searchParams);
    }
  }, [opts, searchParams, setSearchParams]);

  return {
    page: page ? Number(page) : opts?.page ?? 1,
    pageSize: pageSize ? Number(pageSize) : opts?.pageSize ?? 10,
  };
};
