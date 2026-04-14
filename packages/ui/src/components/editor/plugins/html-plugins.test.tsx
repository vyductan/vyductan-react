/* eslint-disable unicorn/no-null -- Lexical APIs and serialized editor fixtures intentionally use null semantics. */
import "@testing-library/jest-dom/vitest";

import * as React from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";

import { HtmlPlugins } from "./html-plugins";

Object.assign(globalThis, { React });

function HtmlPluginsHarness({
  value,
  onChange,
}: {
  value: string;
  onChange?: (htmlString: string) => void;
}) {
  return (
    <LexicalComposer
      initialConfig={{
        namespace: "HtmlPluginsTest",
        theme: {},
        onError: (error) => {
          throw error;
        },
      }}
    >
      <RichTextPlugin
        contentEditable={<ContentEditable aria-label="HTML editor" />}
        placeholder={null}
        ErrorBoundary={LexicalErrorBoundary}
      />
      <HtmlPlugins value={value} onChange={onChange} />
    </LexicalComposer>
  );
}

afterEach(() => {
  cleanup();
});

test("initializes html without inserting a leading empty paragraph", async () => {
  let latestHtml = "";

  render(
    <HtmlPluginsHarness
      value="<p>Hello from html mode.</p>"
      onChange={(htmlString) => {
        latestHtml = htmlString;
      }}
    />,
  );

  await waitFor(() => {
    expect(latestHtml).toContain("Hello from html mode.");
    expect(latestHtml).not.toMatch(/^<p[^>]*><br><\/p>/);
  });
});

test("emits cleaned html without editor-specific classes and whitespace styles", async () => {
  let latestHtml = "";

  render(
    <HtmlPluginsHarness
      value="<p>Hello from html mode.</p>"
      onChange={(htmlString) => {
        latestHtml = htmlString;
      }}
    />,
  );

  await waitFor(() => {
    expect(latestHtml).toContain("<p>Hello from html mode.</p>");
    expect(latestHtml).not.toContain('class="leading-[24px]"');
    expect(latestHtml).not.toContain('style="white-space: pre-wrap;"');
  });
});
