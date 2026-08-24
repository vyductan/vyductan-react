import type { Dayjs } from "dayjs";
import type React from "react";

import { TimePicker } from "..";

const onChange = (time: Dayjs, timeString: string | undefined) => {
  console.log(time, timeString);
};

const App: React.FC = () => (
  <div className="flex flex-wrap gap-2">
    <TimePicker use12Hours onChange={onChange} />
    <TimePicker use12Hours format="h:mm:ss A" onChange={onChange} />
    <TimePicker use12Hours format="h:mm a" onChange={onChange} />
  </div>
);

export default App;
