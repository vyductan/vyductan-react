import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "vitest";

test("date-picker stories include a disabled date and time example", () => {
  const storiesSource = readFileSync(
    path.resolve(import.meta.dirname, "./date-picker.stories.tsx"),
    "utf8",
  );

  expect(storiesSource).toContain(
    'import DisabledDateTimeDemo from "./examples/disabled-date-time";',
  );
  expect(storiesSource).toContain("export const DisabledDateTime: Story = {");
  expect(storiesSource).toContain("render: () => <DisabledDateTimeDemo />");
});

test("disabled date and time example demonstrates Ant Design parity cases", () => {
  const examplePath = path.resolve(
    import.meta.dirname,
    "./examples/disabled-date-time.tsx",
  );

  expect(existsSync(examplePath)).toBe(true);

  const exampleSource = readFileSync(examplePath, "utf8");

  expect(exampleSource).toContain("disabledDate={disabledDate}");
  expect(exampleSource).toContain("disabledTime={disabledDateTime}");
  expect(exampleSource).toContain(
    'showTime={{ defaultOpenValue: dayjs("00:00:00", "HH:mm:ss") }}',
  );
  expect(exampleSource).toContain('picker="month"');
  expect(exampleSource).toContain("disabledDate={disabledDateForMonth}");
  expect(exampleSource).toContain(
    "<DateRangePicker disabledDate={disabledDate}",
  );
  expect(exampleSource).toContain("disabledTime={disabledRangeTime}");
  expect(exampleSource).toContain("hideDisabledOptions: true");
  expect(exampleSource).toContain('dayjs("11:59:59", "HH:mm:ss")');
  expect(exampleSource).toContain('format="YYYY-MM-DD HH:mm:ss"');
  expect(exampleSource).toContain(
    "disabledTime only works when showTime is enabled",
  );
});
