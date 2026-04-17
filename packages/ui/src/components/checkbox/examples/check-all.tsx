import type React from "react";
import { useMemo, useState } from "react";

import { Checkbox } from "@acme/ui/components/checkbox";

const plainOptions = ["Apple", "Pear", "Orange"] as const;

type PlainOption = (typeof plainOptions)[number];

const App: React.FC = () => {
  const [checkedList, setCheckedList] = useState<PlainOption[]>([
    "Apple",
    "Pear",
  ]);

  const indeterminate =
    checkedList.length > 0 && checkedList.length < plainOptions.length;
  const checkAll = checkedList.length === plainOptions.length;
  const groupOptions = useMemo(
    () => plainOptions.map((option) => ({ label: option, value: option })),
    [],
  );

  return (
    <div className="grid gap-3">
      <Checkbox
        checked={checkAll}
        indeterminate={indeterminate}
        onChange={(event) => {
          setCheckedList(event.target.checked ? [...plainOptions] : []);
        }}
      >
        Check all
      </Checkbox>
      <div className="bg-border h-px w-full" />
      <Checkbox.Group
        options={groupOptions}
        value={checkedList}
        onChange={(values) => {
          setCheckedList(values as PlainOption[]);
        }}
      />
    </div>
  );
};

export default App;
