import type React from "react";

import { Segmented } from "@acme/ui/components/segmented";

const App: React.FC = () => (
  <Segmented
    defaultValue="weekly"
    options={[
      { label: "Daily", value: "daily" },
      { label: "Weekly", value: "weekly" },
      { label: "Monthly", value: "monthly" },
    ]}
  />
);

export default App;
