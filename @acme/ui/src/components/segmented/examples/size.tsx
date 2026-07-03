import type React from "react";

import { Segmented } from "@acme/ui/components/segmented";

const options = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
];

const App: React.FC = () => (
  <div className="flex flex-col items-start gap-4">
    <Segmented size="lg" defaultValue="weekly" options={options} />
    <Segmented defaultValue="weekly" options={options} />
    <Segmented size="sm" defaultValue="weekly" options={options} />
  </div>
);

export default App;
