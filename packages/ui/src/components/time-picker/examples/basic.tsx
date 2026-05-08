import type { Dayjs } from "dayjs";
import type React from "react";
import { useState } from "react";

import { TimePicker } from "../";

const App: React.FC = () => {
  const [value, setValue] = useState<Dayjs | null | undefined>();

  return (
    <TimePicker
      value={value}
      onChange={(value_) => {
        console.log("onChange", value_);
        setValue(value_);
      }}
    />
  );
};

export default App;
