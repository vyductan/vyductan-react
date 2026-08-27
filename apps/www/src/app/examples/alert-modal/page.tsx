"use client";

import AlertModalBasicDemo from "@acme/ui/components/alert-modal/examples/basic";
import AlertModalTypesDemo from "@acme/ui/components/alert-modal/examples/types";
import AlertModalWithTextareaDemo from "@acme/ui/components/alert-modal/examples/with-textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@acme/ui/components/card";
import { PageContainer } from "@acme/ui/components/layout";

// Composes the demos directly instead of rendering alert-modal.mdx: that file is
// attached to the Storybook stories tree via `<Meta of>` (a contract covered by
// alert-modal.docs-config.test.ts), so it cannot also be a Next page module.
export default function AlertModalExamples() {
  return (
    <PageContainer header={{ title: "Alert Modal Examples" }}>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Basic</CardTitle>
          <CardDescription>Basic usage of alert modal.</CardDescription>
        </CardHeader>
        <CardContent>
          <AlertModalBasicDemo />
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Types</CardTitle>
          <CardDescription>Info, success, warning, and error.</CardDescription>
        </CardHeader>
        <CardContent>
          <AlertModalTypesDemo />
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>With textarea</CardTitle>
          <CardDescription>
            Collecting input before confirming the action.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertModalWithTextareaDemo />
        </CardContent>
      </Card>
    </PageContainer>
  );
}
