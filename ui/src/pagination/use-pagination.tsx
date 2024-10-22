import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export const usePagination = (options?: { page?: number; pageSize?: number }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = searchParams.get("page");
  const pageSize = searchParams.get("pageSize");

  useEffect(() => {
    if (
      options?.page &&
      !searchParams.has("page") &&
      searchParams.get("page") !== String(options.page)
    ) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(options.page));
      router.push(pathname + "?" + params.toString());
    }
    if (
      options?.pageSize &&
      !searchParams.has("pageSize") &&
      searchParams.get("pageSize") !== String(options.pageSize)
    ) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("pageSize", String(options.pageSize));
      router.push(pathname + "?" + params.toString());
    }
  }, [options, pathname, router, searchParams]);

  return {
    page: page ? Number(page) : 1,
    pageSize: pageSize ? Number(pageSize) : 10,
  };
};
