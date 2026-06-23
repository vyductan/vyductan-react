import type { Dayjs } from "dayjs";
import type React from "react";
import { useState } from "react";
import dayjs from "dayjs";

import { Calendar } from "@acme/ui/components/calendar";

/**
 * Calendar has no `size` prop, and tweaking `--cell-size` alone leaves the font,
 * padding, and gaps unscaled — small/large look cramped. Scale the whole panel
 * uniformly with CSS `zoom` instead: it reflows layout and keeps every internal
 * proportion intact, mirroring Ant Design-like small / middle / large sizing.
 */
const sizes = [
  { label: "Small", zoom: 0.85 },
  { label: "Middle (default)", zoom: 1 },
  { label: "Large", zoom: 1.15 },
] as const;

const App: React.FC = () => {
  const [value, setValue] = useState(dayjs());

  return (
    <div className="flex flex-wrap items-start gap-8">
      {sizes.map((size) => (
        <div key={size.label} className="flex flex-col items-center gap-2">
          <span className="text-muted-foreground text-sm font-medium">
            {size.label}
          </span>
          <div style={{ zoom: size.zoom }}>
            <Calendar
              mode="single"
              value={value}
              onSelect={(date: Dayjs) => setValue(date)}
              className="rounded-md border"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default App;
