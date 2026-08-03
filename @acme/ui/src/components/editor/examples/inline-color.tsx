"use client";

import * as React from "react";

import { Editor, EditorRender } from "@acme/ui/components/editor";

/**
 * The editor and the published view are two different renderers: `Editor` runs
 * Lexical, `EditorRender` walks the serialized document. Text color used to
 * exist only in the first one, so this demo puts them side by side to keep the
 * two honest.
 *
 * `defaultValue` rather than `value`: Lexical reads its initial state once, so
 * feeding the round-tripped JSON back in would not re-initialize the editor.
 */
const INITIAL_VALUE = JSON.stringify({
  root: {
    type: "root",
    direction: "ltr",
    format: "",
    indent: 0,
    version: 1,
    children: [
      {
        type: "paragraph",
        direction: "ltr",
        format: "",
        indent: 0,
        version: 1,
        children: [
          {
            detail: 0,
            format: 0,
            mode: "normal",
            style: "color: #eb5757",
            text: "Colored text",
            type: "text",
            version: 1,
          },
          {
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: ", ",
            type: "text",
            version: 1,
          },
          {
            detail: 0,
            format: 0,
            mode: "normal",
            style: "background-color: #fff3bf",
            text: "highlighted text",
            type: "text",
            version: 1,
          },
          {
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: ", and ",
            type: "text",
            version: 1,
          },
          {
            detail: 0,
            format: 1,
            mode: "normal",
            style: "font-size: 20px; color: #2f9e44",
            text: "bold, larger, colored text",
            type: "text",
            version: 1,
          },
          {
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: ".",
            type: "text",
            version: 1,
          },
        ],
      },
    ],
  },
});

export default function InlineColorDemo() {
  const [value, setValue] = React.useState(INITIAL_VALUE);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-2">
        <p className="text-muted-foreground text-sm">
          Editor — use the toolbar to change text color, highlight, or size.
        </p>
        <div className="rounded-md border">
          <Editor
            autoFocus={false}
            defaultValue={INITIAL_VALUE}
            format="json"
            onChange={setValue}
            variant="simple"
          />
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-muted-foreground text-sm">
          Published view — <code>EditorRender</code> of the same document.
          Colors must match the editor; declarations outside the allowlist
          (positioning, <code>url()</code>, and friends) are dropped.
        </p>
        <div className="rounded-md border p-4">
          <EditorRender format="json" value={value} />
        </div>
      </div>
    </div>
  );
}
