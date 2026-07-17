import React from "react";

import { Select } from "@acme/ui/components/select";

import type { OptionType } from "../types";

// Reproduces a trigger whose height grows to a multi-line custom option label,
// to check chevron + clear positioning when the control is tall.
const richOptions: OptionType<string>[] = [
  {
    value: "izakaya",
    label: (
      <div className="flex flex-col">
        <span className="font-semibold">
          The Izakaya-Jul 31, 26-5:00 PM-9 adults ⭐
        </span>
        <span className="text-muted-foreground text-xs">
          Reference: ggg, Chinmay Puranik, Chinmay Puranik
        </span>
      </div>
    ),
  },
  {
    value: "sushi",
    label: (
      <div className="flex flex-col">
        <span className="font-semibold">
          Sushi Bar-Aug 02, 26-7:30 PM-4 adults
        </span>
        <span className="text-muted-foreground text-xs">
          Reference: abc, Jane Doe
        </span>
      </div>
    ),
  },
];

const App: React.FC = () => {
  const [value, setValue] = React.useState<string>("izakaya");

  return (
    <Select
      value={value}
      onChange={(next: string) => setValue(next)}
      allowClear
      placeholder="Select a booking"
      // Radix trigger is a fixed `h-control`; opt into auto height so a tall
      // multi-line label grows the box instead of overflowing it.
      className="h-auto! min-h-[52px] w-[520px]"
      options={richOptions}
    />
  );
};

export default App;
