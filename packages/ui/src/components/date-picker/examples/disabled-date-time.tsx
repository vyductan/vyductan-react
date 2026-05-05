import dayjs from "dayjs";

import {
  DatePicker,
  DateRangePicker,
} from "@acme/ui/components/date-picker";
import { Space } from "@acme/ui/components/space";

const range = (start: number, end: number) =>
  Array.from({ length: end - start }, (_, index) => start + index);

const disabledDate = (current: dayjs.Dayjs) => {
  return current.isBefore(dayjs().endOf("day"));
};

const disabledDateForMonth = (current: dayjs.Dayjs) => {
  return current.isBefore(dayjs().startOf("month"));
};

const disabledDateTime = () => ({
  disabledHours: () => range(0, 24).slice(4),
  disabledMinutes: () => range(30, 60),
  disabledSeconds: () => [55, 56],
});

const disabledRangeTime = (_: dayjs.Dayjs | null, type: "start" | "end") => {
  if (type === "start") {
    return {
      disabledHours: () => range(0, 24).slice(4),
      disabledMinutes: () => range(30, 60),
      disabledSeconds: () => [55, 56],
    };
  }

  return {
    disabledHours: () => range(0, 24).slice(20),
    disabledMinutes: () => range(0, 31),
    disabledSeconds: () => [55, 56],
  };
};

const DisabledDateTimeDemo = () => (
  <Space direction="vertical" size={12}>
    <DatePicker
      format="YYYY-MM-DD HH:mm:ss"
      disabledDate={disabledDate}
      disabledTime={disabledDateTime}
      showTime={{ defaultOpenValue: dayjs("00:00:00", "HH:mm:ss") }}
      placeholder="Select date & time"
      className="w-[240px]"
    />
    <DatePicker
      picker="month"
      disabledDate={disabledDateForMonth}
      placeholder="Select month"
      className="w-[240px]"
    />
    <DateRangePicker disabledDate={disabledDate} className="w-[320px]" />
    <DateRangePicker
      disabledDate={disabledDate}
      disabledTime={disabledRangeTime}
      showTime={{
        hideDisabledOptions: true,
        defaultOpenValue: [
          dayjs("00:00:00", "HH:mm:ss"),
          dayjs("11:59:59", "HH:mm:ss"),
        ],
      }}
      format="YYYY-MM-DD HH:mm:ss"
      className="w-[420px]"
    />
    <p className="text-muted-foreground text-sm">
      disabledTime only works when showTime is enabled.
    </p>
  </Space>
);

export default DisabledDateTimeDemo;
