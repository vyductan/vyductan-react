"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@acme/ui/components/card";
import EditorDemo from "@acme/ui/components/editor/examples/basic";
import EditorInlineColorDemo from "@acme/ui/components/editor/examples/inline-color";
import EditorKitchenSinkDemo from "@acme/ui/components/editor/examples/kitchen-sink";
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

      {/* Inline color parity between the editor and the published view */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Inline color</CardTitle>
          <CardDescription>
            Text color, highlight, and size survive the round trip from the
            editor into <code>EditorRender</code>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EditorInlineColorDemo />
        </CardContent>
      </Card>

      {/* Full-coverage document across all three renderers */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Kitchen sink</CardTitle>
          <CardDescription>
            Every block and inline feature in one document, viewable through the
            editor, the read-only preview, and the published renderer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EditorKitchenSinkDemo />
        </CardContent>
      </Card>
    </PageContainer>
  );
}
