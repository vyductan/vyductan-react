
import type { Dayjs } from "dayjs";
import type React from "react";
import { useState } from "react";

import { TimePicker } from "../";

const App: React.FC = () => {
  const [value, setValue] = useState<Dayjs | null | undefined>(null);

  return (
    <TimePicker
      value={value}
      onChange={(val) => {
        console.log("onChange", val);
        setValue(val);
      }}
    />
  );
};

export default App;
