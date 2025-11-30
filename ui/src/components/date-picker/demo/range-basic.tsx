import type { Dayjs } from "dayjs";
import type React from "react";
import { useState } from "react";
import { DateRangePicker } from "@acme/ui/components/date-picker";

const App: React.FC = () => {
  const [value, setValue] = useState<[Dayjs | null, Dayjs | null] | null>(null);

  return (
    <DateRangePicker
      value={value}
      onChange={(dates) => {
        setValue(dates);
        console.log("Selected dates:", dates);
      }}
      placeholder={["Start Date", "End Date"]}
    />
  );
};

export default App;
