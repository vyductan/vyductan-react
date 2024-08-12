"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebounceFn } from "ahooks";

import { Input } from ".";
import { Icon } from "../icons";

type SearchProps = {
  placeholder?: string;
};
export const InputSearch = ({ placeholder }: SearchProps) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const { run: handleSearch } = useDebounceFn(
    (term: string) => {
      const params = new URLSearchParams(searchParams);
      params.set("page", "1");
      if (term) {
        params.set("query", term);
      } else {
        params.delete("query");
      }
      router.replace(`${pathname}?${params.toString()}`);
    },
    {
      wait: 300,
    },
  );

  return (
    <Input
      allowClear
      defaultValue={searchParams.get("query")?.toString()}
      placeholder={placeholder ?? "Search..."}
      suffix={<Icon icon="icon-[lucide--search]" />}
      onChange={(e) => {
        handleSearch(e.target.value);
      }}
    />
  );
};
