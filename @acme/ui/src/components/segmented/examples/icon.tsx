import type React from "react";

import { Segmented } from "@acme/ui/components/segmented";
import { Icon } from "@acme/ui/icons";

const App: React.FC = () => (
  <Segmented
    defaultValue="list"
    options={[
      {
        label: "List",
        value: "list",
        icon: <Icon icon="icon-[lucide--list]" className="size-4" />,
        tooltip: "List view",
      },
      {
        label: "Kanban",
        value: "kanban",
        icon: <Icon icon="icon-[lucide--columns-3]" className="size-4" />,
        tooltip: "Kanban view",
      },
      {
        label: "Grid",
        value: "grid",
        icon: <Icon icon="icon-[lucide--layout-grid]" className="size-4" />,
        tooltip: { title: "Grid view", placement: "bottom" },
      },
    ]}
  />
);

export default App;
