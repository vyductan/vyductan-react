"use client";

import * as React from "react";

import {
  Editor,
  EditorPreview,
  EditorRender,
} from "@acme/ui/components/editor";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@acme/ui/components/tabs";

import { kitchenSinkValue } from "./kitchen-sink-document";

/**
 * The same document through all three renderers. Editing the top pane updates
 * the panes below, which is the point: `Editor` and `EditorPreview` run Lexical,
 * while `EditorRender` walks the serialized document with its own code, so this
 * is where the two implementations can be seen agreeing — or not.
 *
 * The lower panes are not force-mounted. They mount when their tab is opened, so
 * each one reads the current value instead of remounting Lexical on every
 * keystroke.
 */
export default function KitchenSinkDemo() {
  const [value, setValue] = React.useState(kitchenSinkValue);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-muted-foreground text-sm">
          Editor — the full toolbar is available; try the text color and
          highlight pickers.
        </p>
        <div className="rounded-md border">
          <Editor
            autoFocus={false}
            defaultValue={kitchenSinkValue}
            format="json"
            onChange={setValue}
            variant="simple"
          />
        </div>
      </div>

      <Tabs defaultValue="published" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="published">Published</TabsTrigger>
          <TabsTrigger value="read-only">Read-only</TabsTrigger>
          <TabsTrigger value="json">JSON</TabsTrigger>
        </TabsList>

        <TabsContent value="published">
          <p className="text-muted-foreground mb-2 text-sm">
            <code>EditorRender</code> — the serialized-document renderer used
            for published pages. Unsupported nodes (images, equations, polls)
            are dropped here by design.
          </p>
          <div className="rounded-md border p-4">
            <EditorRender format="json" value={value} />
          </div>
        </TabsContent>

        <TabsContent value="read-only">
          <p className="text-muted-foreground mb-2 text-sm">
            <code>EditorPreview</code> — Lexical with editing disabled, so it
            renders everything the editor can, including nodes the published
            view drops.
          </p>
          <div className="rounded-md border">
            <EditorPreview autoFocus={false} format="json" value={value} />
          </div>
        </TabsContent>

        <TabsContent value="json">
          <pre className="max-h-96 overflow-auto rounded-md border p-4 text-xs">
            {JSON.stringify(JSON.parse(value), null, 2)}
          </pre>
        </TabsContent>
      </Tabs>
    </div>
  );
}
