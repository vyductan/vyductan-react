import type React from "react";

import { Segmented } from "@acme/ui/components/segmented";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const App: React.FC = () => (
  // chiều rộng giới hạn để item tràn → scroll ngang + fade 2 mép
  <div className="max-w-sm">
    <Segmented
      defaultValue="June"
      options={months.map((month) => ({ label: month, value: month }))}
    />
  </div>
);

export default App;
