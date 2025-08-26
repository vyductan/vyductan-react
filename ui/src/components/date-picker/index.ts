import { DatePicker as InternalDatePicker } from "./date-picker";
import { DateRangePicker } from "./date-range-picker";
import { MonthPicker } from "./month-picker";

import { YearPicker } from "./year-picker";

export * from "./date-picker";
export * from "./date-range-picker";
export * from "./month-picker";
export * from "./year-picker";

type CompoundedComponent = typeof InternalDatePicker & {
  RangePicker: typeof DateRangePicker;
  MonthPicker: typeof MonthPicker;
  YearPicker: typeof YearPicker;
};

const DatePicker = InternalDatePicker as CompoundedComponent;
DatePicker.RangePicker = DateRangePicker;
DatePicker.MonthPicker = MonthPicker;
DatePicker.YearPicker = YearPicker;

export { DatePicker };
