import type React from "react";
import dayjs from "dayjs";

import { TimePicker } from "..";

const range = (start: number, end: number): number[] =>
  Array.from({ length: end - start }, (_, index) => start + index);

const App: React.FC = () => (
  <TimePicker
    defaultValue={dayjs("14:30:20", "HH:mm:ss")}
    disabledTime={() => ({
      // Block 00:00–05:xx entirely.
      disabledHours: () => range(0, 6),
      // For 06:xx only, block the first half hour.
      disabledMinutes: (hour) => (hour === 6 ? range(0, 30) : []),
      // For any :30 minute, block the first 3 seconds.
      disabledSeconds: (_hour, minute) => (minute === 30 ? [0, 1, 2] : []),
    })}
  />
);

export default App;
