import type { Dayjs } from "dayjs";
import type React from "react";
import { useState } from "react";
import { DateRangePicker } from "@/components/ui/date-picker";
import { Space } from "@/components/ui/space";
import dayjs from "dayjs";

const VariantsDemo: React.FC = () => {
  const [basicValue, setBasicValue] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(null);
  const [separateValue, setSeparateValue] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(null);
  const [singleCalendarValue, setSingleCalendarValue] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(null);
  const [withTimeValue, setWithTimeValue] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(null);
  const [withMinMaxValue, setWithMinMaxValue] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(null);
  const [disabledValue, setDisabledValue] = useState<
    [Dayjs | null, Dayjs | null] | null
  >([dayjs().subtract(7, "day"), dayjs()]);
  const [errorValue, setErrorValue] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(null);

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <div>
        <h3 className="mb-2 text-sm font-medium">Basic Usage</h3>
        <DateRangePicker
          value={basicValue}
          onChange={(dates) => setBasicValue(dates)}
          placeholder={["Start Date", "End Date"]}
        />
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium">
          Separate Calendars (Default)
        </h3>
        <DateRangePicker
          value={separateValue}
          onChange={(dates) => setSeparateValue(dates)}
          separateCalendars={true}
          placeholder={["Start Date", "End Date"]}
        />
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium">Single Calendar (2 Panels)</h3>
        <DateRangePicker
          value={singleCalendarValue}
          onChange={(dates) => setSingleCalendarValue(dates)}
          separateCalendars={false}
          placeholder={["Start Date", "End Date"]}
        />
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium">With Time</h3>
        <DateRangePicker
          value={withTimeValue}
          onChange={(dates) => setWithTimeValue(dates)}
          showTime
          placeholder={["Start Date & Time", "End Date & Time"]}
        />
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium">With Min/Max Date</h3>
        <DateRangePicker
          value={withMinMaxValue}
          onChange={(dates) => setWithMinMaxValue(dates)}
          minDate={dayjs().subtract(30, "day")}
          maxDate={dayjs().add(30, "day")}
          placeholder={["Start Date", "End Date"]}
        />
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium">Sizes</h3>
        <Space direction="vertical" size="middle">
          <DateRangePicker size="small" placeholder={["Small", "Small"]} />
          <DateRangePicker size="middle" placeholder={["Middle", "Middle"]} />
          <DateRangePicker size="large" placeholder={["Large", "Large"]} />
        </Space>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium">Variants</h3>
        <Space direction="vertical" size="middle">
          <DateRangePicker
            variant="outlined"
            placeholder={["Outlined", "Outlined"]}
          />
          <DateRangePicker
            variant="filled"
            placeholder={["Filled", "Filled"]}
          />
          <DateRangePicker
            variant="borderless"
            placeholder={["Borderless", "Borderless"]}
          />
        </Space>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium">Status</h3>
        <Space direction="vertical" size="middle">
          <DateRangePicker status="error" placeholder={["Error", "Error"]} />
          <DateRangePicker
            status="warning"
            placeholder={["Warning", "Warning"]}
          />
        </Space>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium">Disabled</h3>
        <DateRangePicker
          value={disabledValue}
          onChange={(dates) => setDisabledValue(dates)}
          disabled
          placeholder={["Disabled", "Disabled"]}
        />
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium">With Allow Clear</h3>
        <DateRangePicker
          value={errorValue}
          onChange={(dates) => setErrorValue(dates)}
          allowClear
          placeholder={["Start Date", "End Date"]}
        />
      </div>
    </Space>
  );
};

export default VariantsDemo;
