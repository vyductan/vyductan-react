import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export const usePagination = (opts?: { page?: number; pageSize?: number }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = searchParams.get("page");
  const pageSize = searchParams.get("pageSize");

  useEffect(() => {
    if (
      opts?.page &&
      !searchParams.has("page") &&
      searchParams.get("page") !== String(opts.page)
    ) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(opts.page));
      router.push(pathname + "?" + params.toString());
    }
    if (
      opts?.pageSize &&
      !searchParams.has("pageSize") &&
      searchParams.get("pageSize") !== String(opts.pageSize)
    ) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("pageSize", String(opts.pageSize));
      router.push(pathname + "?" + params.toString());
    }
  }, [opts, pathname, router, searchParams]);

  return {
    page: page ? Number(page) : 1,
    pageSize: pageSize ? Number(pageSize) : 10,
  };
};
