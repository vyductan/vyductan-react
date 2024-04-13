import { Calendar } from "../calendar";

// TODO: https://react-day-picker.js.org/guides/input-fields?#example-range-selection
type DateRange = {
  start: Date | undefined;
  end?: Date | undefined;
};
export type DateRangePickerProps = {
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
};
export const DateRangePicker = (_props: DateRangePickerProps) => {
  return (
    <div>
      <Calendar
        mode="range"
        initialFocus
        // selected={{
        //   from: value?.start,
        //   to: value?.end,
        // }}
        // onSelect={(range) => {
        //   onChange?.({
        //     start: range?.from,
        //     end: range?.to,
        //   });
        // }}
        numberOfMonths={2}
        //{...rest}
      />
    </div>
  );
};
