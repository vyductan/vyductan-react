"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import EditorDemo from "@/components/ui/editor/examples/basic";

import { PageContainer } from "@acme/ui/components/layout";

export default function CheckboxExamples() {
  return (
    <PageContainer
      header={{
        title: "Editor Examples",
        // breadcrumb: {
        //   items: [
        //     {
        //       label: "Examples",
        //       href: "/examples",
        //     },
        //   ],
        // },
      }}
    >
      {/* Basic Usage */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Basic</CardTitle>
          <CardDescription>Basic usage of editor.</CardDescription>
        </CardHeader>
        <CardContent>
          <EditorDemo />
        </CardContent>
      </Card>
    </PageContainer>
  );
}
