"use client";

import React, { useState } from "react";
import { Dayjs } from "dayjs";
import dayjs from "dayjs";

import { YearPicker } from "./year-picker";

export function YearPickerDemo() {
  const [year, setYear] = useState<number | Dayjs | undefined>(2024);
  const [year2, setYear2] = useState<number | Dayjs | undefined>();

  return (
    <div className="space-y-8 p-8">
      <div>
        <h3 className="text-lg font-medium mb-4">Basic Year Picker</h3>
        <YearPicker
          value={year}
          onChange={setYear}
          placeholder="Select year"
        />
        <p className="text-sm text-muted-foreground mt-2">
          Selected year: {year ? dayjs(year).format("YYYY") : "None"}
        </p>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Year Picker with Clear</h3>
        <YearPicker
          value={year2}
          onChange={setYear2}
          placeholder="Select year"
          allowClear={true}
        />
        <p className="text-sm text-muted-foreground mt-2">
          Selected year: {year2 ? dayjs(year2).format("YYYY") : "None"}
        </p>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Disabled Year Picker</h3>
        <YearPicker
          value={2024}
          disabled={true}
          placeholder="Select year"
        />
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Custom Format Year Picker</h3>
        <YearPicker
          value={year}
          onChange={setYear}
          placeholder="Select year"
          format="YY"
        />
        <p className="text-sm text-muted-foreground mt-2">
          Selected year (YY format): {year ? dayjs(year).format("YY") : "None"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium mb-2">Small Size</h4>
          <YearPicker
            value={year}
            onChange={setYear}
            placeholder="Select year"
            className="h-8 text-sm"
          />
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-2">Large Size</h4>
          <YearPicker
            value={year}
            onChange={setYear}
            placeholder="Select year"
            className="h-12 text-lg"
          />
        </div>
      </div>
    </div>
  );
}

// Usage examples for documentation
export const yearPickerUsageExamples = [
  {
    title: "Basic Usage",
    code: `<YearPicker 
  value={selectedYear} 
  onChange={setSelectedYear} 
  placeholder="Select year" 
/>`,
  },
  {
    title: "With Clear Button",
    code: `<YearPicker 
  value={selectedYear} 
  onChange={setSelectedYear} 
  allowClear={true} 
/>`,
  },
  {
    title: "Disabled State",
    code: `<YearPicker 
  value={2024} 
  disabled={true} 
/>`,
  },
  {
    title: "Custom Format",
    code: `<YearPicker 
  value={selectedYear} 
  onChange={setSelectedYear} 
  format="YY" 
/>`,
  },
];
