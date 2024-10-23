import { cn } from "../..";

type TimeSelectProps = {
  value?: Date;
  onChange?: (value: Date) => void;

  format?: string;
};
export const TimeSelect = ({
  value,
  format = "HH:mm",
  onChange,
}: TimeSelectProps) => {
  const hourType = format.split(":")[0];
  const hourOptions = Array.from(
    { length: hourType === "HH" ? 24 : 12 },
    (_, index) => index,
  );
  const minuteOptions = Array.from({ length: 60 }, (_, index) => index);
  return (
    <div className="flex flex-col py-3 pr-3">
      <div className="flex h-[224px] flex-auto divide-x">
        <ul className="flex flex-1 flex-col gap-0.5 overflow-y-auto">
          {/* <ScrollArea className="h-[227px]"> */}
          {hourOptions.map((hour) => (
            <li
              key={hour}
              className={cn(
                "mx-1 flex cursor-pointer justify-center rounded-sm px-4 py-1",
                "hover:bg-background-hover",
                value?.getHours() === hour && "bg-primary-200",
              )}
              onClick={() => {
                const newDate = value ?? new Date();
                newDate.setHours(hour);
                onChange?.(newDate);
              }}
            >
              {hour.toString().padStart(2, "0")}
            </li>
          ))}
          {/* </ScrollArea> */}
        </ul>
        <ul className="flex flex-col gap-0.5 overflow-y-auto">
          {minuteOptions.map((minute) => (
            <li
              key={minute}
              className={cn(
                "mx-1 flex cursor-pointer justify-center rounded-sm px-4 py-1",
                "hover:bg-background-hover",
                value?.getMinutes() === minute && "bg-primary-200",
              )}
              onClick={() => {
                const newDate = value ?? new Date();
                newDate.setMinutes(minute);
                onChange?.(newDate);
              }}
            >
              {minute.toString().padStart(2, "0")}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export type { TimeSelectProps };
