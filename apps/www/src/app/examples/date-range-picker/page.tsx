"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@acme/ui/components/card";
import DateRangePickerBasicDemo from "@acme/ui/components/date-picker/examples/range-basic";
import DateRangePickerVariantsDemo from "@acme/ui/components/date-picker/examples/range-variants";
import { PageContainer } from "@acme/ui/components/layout";

// Composes the range demos directly rather than rendering date-picker.mdx:
// that file is Storybook-only — it relies on components Storybook injects
// through its MDX provider, which Next has no equivalent for.
export default function DateRangePickerExamples() {
  return (
    <PageContainer header={{ title: "Date Range Picker Examples" }}>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Basic</CardTitle>
          <CardDescription>Basic usage of date range picker.</CardDescription>
        </CardHeader>
        <CardContent>
          <DateRangePickerBasicDemo />
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Variants</CardTitle>
          <CardDescription>
            Range picker variants and sizing options.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DateRangePickerVariantsDemo />
        </CardContent>
      </Card>
    </PageContainer>
  );
}
