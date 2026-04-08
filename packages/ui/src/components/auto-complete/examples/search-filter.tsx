import * as React from "react";

import {
  AutoComplete,
  removeTones,
} from "@acme/ui/components/auto-complete";

const searchOptions = [
  { label: "Cà phê sữa", value: "cafe-sua" },
  { label: "Bánh mì", value: "banh-mi" },
  { label: "Phở bò", value: "pho-bo" },
] as const;

const SearchFilterDemo = () => {
  const [search, setSearch] = React.useState("");

  return (
    <div className="space-y-2">
      <div className="w-[320px]">
        <AutoComplete
          mode="input"
          placeholder="Search menu items"
          searchPlaceholder="Type to filter"
          options={[...searchOptions]}
          onSearchChange={setSearch}
          filter={(value, query) => {
            const option = searchOptions.find((item) => item.value === value);
            if (!option) return 0;
            return removeTones(String(option.label).toLowerCase()).includes(
              removeTones(query.toLowerCase()),
            )
              ? 1
              : 0;
          }}
        />
      </div>
      <div data-testid="search-value">{search || "empty"}</div>
    </div>
  );
};

export default SearchFilterDemo;
