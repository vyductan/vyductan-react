import type { AnyObject } from "@/components/ui/_util/type";
import * as React from "react";

import type { FilterSearchType, TableLocale } from "../../types";
import { Icon } from "../../../../icons";
import { Input } from "../../../input";

interface FilterSearchProps<RecordType = AnyObject> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  filterSearch: FilterSearchType<RecordType>;
  locale: TableLocale;
}

const FilterSearch = <RecordType extends AnyObject = AnyObject>(
  props: FilterSearchProps<RecordType>,
) => {
  const { value, filterSearch, locale, onChange } = props;
  if (!filterSearch) {
    return null;
  }
  return (
    <div className={`filter-dropdown-search`}>
      <Input
        prefix={<Icon icon="icon-[lucide--search]" />}
        placeholder={locale.filterSearchPlaceholder}
        onChange={onChange}
        value={value}
        // for skip min-width of input
        htmlSize={1}
        className={`filter-dropdown-search-input`}
      />
    </div>
  );
};

export default FilterSearch;
