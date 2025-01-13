"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebounceFn } from "ahooks";

import type { InputProps } from "@acme/ui/input";
import { Icon } from "@acme/ui/icons";
import { Input } from "@acme/ui/input";

type InputSearchProps = InputProps;
export const InputSearch = ({ placeholder, ...props }: InputSearchProps) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const { run: handleSearch } = useDebounceFn(
    (term: string) => {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set("page", "1");
      if (term) {
        newSearchParams.set("query", term);
      } else {
        newSearchParams.delete("query");
      }
      router.replace(`${pathname}?${newSearchParams.toString()}`);
    },
    {
      wait: 300,
    },
  );
  // return <InputSearchBase defaultValue={searchParams.get("query")?.toString()}
  // placeholder={placeholder ?? "Search..."}
  // prefix={<Icon icon="icon-[lucide--search]" />}
  // onChange={(event) => {
  //   handleSearch(event.target.value);
  // }}
  // {...props}/>

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
