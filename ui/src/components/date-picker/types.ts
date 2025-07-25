import type { InputRef } from "../input";

export type PanelMode =
  | "time"
  | "date"
  | "week"
  | "month"
  | "quarter"
  | "year"
  | "decade";
export type DisabledDate<DateType = any> = (
  date: DateType,
  info: {
    type: PanelMode;
    /**
     * Only work in RangePicker.
     * Tell the first date user selected on this range selection.
     * This is not care about what field user click.
     */
    from?: DateType;
  },
) => boolean;

export type PickerRef = Pick<
  InputRef,
  "select" | "setCustomValidity" | "reportValidity"
> & {
  nativeElement: HTMLDivElement;
  focus: (options?: FocusOptions) => void;
  blur: VoidFunction;
};
