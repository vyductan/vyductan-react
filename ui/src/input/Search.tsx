"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebounceFn } from "ahooks";

import type { InputProps } from "./input";
import { Icon } from "../icons";
import { Input } from "./input";

type SearchProps = InputProps;
export const InputSearch = ({ placeholder, ...props }: SearchProps) => {
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
      prefix={<Icon icon="icon-[lucide--search]" />}
      onChange={(event) => {
        handleSearch(event.target.value);
      }}
      {...props}
    />
  );
};
