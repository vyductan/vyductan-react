/* eslint-disable unicorn/no-null -- Lexical APIs and serialized editor fixtures intentionally use null semantics. */
import * as React from "react";

import { Editor } from "../editor";
import {
  editorRenderFixtures,
  editorRenderSourceFixtures,
} from "../render/render-fixtures";

type EditorFormat = "json" | "markdown" | "html";
type EditorVariant = "default" | "simple" | "minimal";
type EditorStats = {
  wordCount: number;
  characterCount: number;
  readingTimeMinutes: number;
};

type Preset = {
  label: string;
  description: string;
  value: string;
};

const EMPTY_STATS: EditorStats = {
  wordCount: 0,
  characterCount: 0,
  readingTimeMinutes: 0,
};

const JSON_PRESETS: [Preset, ...Preset[]] = [
  {
    label: "Starter",
    description: "A semantic table example for experimenting with JSON output.",
    value: JSON.stringify(editorRenderFixtures.table.content, null, 2),
  },
  {
    label: "Checklist",
    description: "Structured content for validating serialized editor state.",
    value: JSON.stringify(
      {
        root: {
          type: "root",
          format: "",
          indent: 0,
          version: 1,
          direction: "ltr",
          children: [
            {
              type: "paragraph",
              format: "",
              indent: 0,
              version: 1,
              direction: "ltr",
              children: [
                {
                  detail: 0,
                  format: 0,
                  mode: "normal",
                  style: "",
                  text: "Release checklist",
                  type: "text",
                  version: 1,
                },
              ],
            },
            {
              type: "paragraph",
              format: "",
              indent: 0,
              version: 1,
              direction: "ltr",
              children: [
                {
                  detail: 0,
                  format: 0,
                  mode: "normal",
                  style: "",
                  text: "QA verified, docs updated, launch approved.",
                  type: "text",
                  version: 1,
                },
              ],
            },
          ],
        },
      },
      null,
      2,
    ),
  },
  {
    label: "Publish",
    description: "A denser payload for testing larger editor snapshots.",
    value: JSON.stringify(
      {
        root: {
          type: "root",
          format: "",
          indent: 0,
          version: 1,
          direction: "ltr",
          children: [
            {
              type: "paragraph",
              format: "",
              indent: 0,
              version: 1,
              direction: "ltr",
              children: [
                {
                  detail: 0,
                  format: 0,
                  mode: "normal",
                  style: "",
                  text: "Publishing notes with metadata and summary blocks.",
                  type: "text",
                  version: 1,
                },
              ],
            },
          ],
        },
      },
      null,
      2,
    ),
  },
];

const MARKDOWN_PRESETS: [Preset, ...Preset[]] = [
  {
    label: "Starter",
    description:
      "A semantic table example for experimenting with markdown output.",
    value: editorRenderSourceFixtures.table.markdown,
  },
  {
    label: "Docs",
    description: "Technical documentation style content.",
    value: `# API Integration Guide\n\n## Steps\n\n1. Create an access token\n2. Store the project key\n3. Verify the webhook signature\n\n> Keep staging and production configs separate.`,
  },
  {
    label: "Release",
    description: "A polished release note sample.",
    value: `# Release Notes\n\n**What shipped**\n\n- New editor playground\n- Faster preset switching\n- Cleaner output preview`,
  },
];

const HTML_PRESETS: [Preset, ...Preset[]] = [
  {
    label: "Starter",
    description: "A semantic table example for experimenting with HTML output.",
    value: editorRenderSourceFixtures.table.html,
  },
  {
    label: "Formatted",
    description: "Mixed formatting, lists, and inline emphasis.",
    value: `<h1>Team Update</h1><p><strong>Today</strong> we shipped the editor playground and refreshed the story layout.</p><ul><li>Preset switching</li><li>Live output</li><li>Reading stats</li></ul>`,
  },
  {
    label: "Rich",
    description: "A more editorial HTML sample.",
    value: `<h1>Design Review</h1><blockquote>Balance polish with clarity.</blockquote><p>Use the output panel to inspect exactly what the editor returns.</p>`,
  },
];

const PRESETS: Record<EditorFormat, [Preset, ...Preset[]]> = {
  json: JSON_PRESETS,
  markdown: MARKDOWN_PRESETS,
  html: HTML_PRESETS,
};

const FORMAT_LABELS: Record<EditorFormat, string> = {
  json: "JSON",
  markdown: "Markdown",
  html: "HTML",
};

const INITIAL_VALUES: Record<EditorFormat, string> = {
  json: PRESETS.json[0].value,
  markdown: PRESETS.markdown[0].value,
  html: PRESETS.html[0].value,
};

const INITIAL_EDITOR_RESET_KEYS: Record<EditorFormat, number> = {
  json: 0,
  markdown: 0,
  html: 0,
};

const HTML_BLOCK_TAGS = new Set([
  "article",
  "aside",
  "blockquote",
  "div",
  "figcaption",
  "figure",
  "footer",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "header",
  "li",
  "main",
  "nav",
  "ol",
  "p",
  "section",
  "table",
  "tbody",
  "td",
  "tfoot",
  "th",
  "thead",
  "tr",
  "ul",
]);

function formatJsonDisplayValue(value: string) {
  if (!value.trim()) {
    return value;
  }

  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
}

function isInlineHtmlNode(node: ChildNode) {
  if (node.nodeType === Node.TEXT_NODE) {
    return !!node.textContent?.trim();
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return false;
  }

  return !HTML_BLOCK_TAGS.has((node as Element).tagName.toLowerCase());
}

function formatHtmlDisplayNode(node: ChildNode, depth: number): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent?.trim() ?? "";
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return "";
  }

  const element = node as Element;
  const tagName = element.tagName.toLowerCase();
  const indent = "  ".repeat(depth);
  const attributes = [...element.attributes]
    .map((attribute) => ` ${attribute.name}="${attribute.value}"`)
    .join("");
  const openingTag = `<${tagName}${attributes}>`;
  const closingTag = `</${tagName}>`;
  const renderedChildren = [...element.childNodes]
    .map((childNode) => formatHtmlDisplayNode(childNode, depth + 1))
    .filter(Boolean);

  if (renderedChildren.length === 0) {
    return `${indent}${openingTag}${closingTag}`;
  }

  if (
    [...element.childNodes].every((childNode) => isInlineHtmlNode(childNode))
  ) {
    return `${indent}${openingTag}${renderedChildren.join("")}${closingTag}`;
  }

  return `${indent}${openingTag}\n${renderedChildren.join("\n")}\n${indent}${closingTag}`;
}

function formatHtmlDisplayValue(value: string) {
  if (!value.trim()) {
    return value;
  }

  try {
    const document = new DOMParser().parseFromString(value, "text/html");
    const formattedValue = [...document.body.childNodes]
      .map((node) => formatHtmlDisplayNode(node, 0))
      .filter(Boolean)
      .join("\n");

    return formattedValue || value;
  } catch {
    return value;
  }
}

export default function PlaygroundDemo() {
  const [activeFormat, setActiveFormat] = React.useState<EditorFormat>("json");
  const [values, setValues] =
    React.useState<Record<EditorFormat, string>>(INITIAL_VALUES);
  const [editorResetKeys, setEditorResetKeys] = React.useState<
    Record<EditorFormat, number>
  >(INITIAL_EDITOR_RESET_KEYS);
  const [statsByFormat, setStatsByFormat] = React.useState<
    Record<EditorFormat, EditorStats>
  >({
    json: EMPTY_STATS,
    markdown: EMPTY_STATS,
    html: EMPTY_STATS,
  });
  const [editable, setEditable] = React.useState(true);
  const [autoFocus, setAutoFocus] = React.useState(false);
  const [variant, setVariant] = React.useState<EditorVariant>("default");
  const [placeholder, setPlaceholder] = React.useState(
    "Shape the content, switch formats, and inspect the output below.",
  );

  const activePresets = React.useMemo(
    () => PRESETS[activeFormat],
    [activeFormat],
  );
  const activeValue = values[activeFormat];
  const displayValue = React.useMemo(() => {
    if (activeFormat === "json") {
      return formatJsonDisplayValue(activeValue);
    }

    if (activeFormat === "html") {
      return formatHtmlDisplayValue(activeValue);
    }

    return activeValue;
  }, [activeFormat, activeValue]);
  const activeEditorResetKey = editorResetKeys[activeFormat];
  const activeStats = statsByFormat[activeFormat];
  const outputTitle =
    activeFormat === "html"
      ? "Cleaned HTML Output"
      : `${FORMAT_LABELS[activeFormat]} Output`;

  const updateActiveValue = React.useCallback(
    (nextValue: string) => {
      setValues((currentValues) => ({
        ...currentValues,
        [activeFormat]: nextValue,
      }));
    },
    [activeFormat],
  );

  const handleStatsChange = React.useCallback(
    (nextStats: EditorStats) => {
      setStatsByFormat((currentStats) => ({
        ...currentStats,
        [activeFormat]: nextStats,
      }));
    },
    [activeFormat],
  );

  const applyPreset = React.useCallback(
    (preset: Preset) => {
      setValues((currentValues) => ({
        ...currentValues,
        [activeFormat]: preset.value,
      }));
      setEditorResetKeys((currentKeys) => ({
        ...currentKeys,
        [activeFormat]: currentKeys[activeFormat] + 1,
      }));
    },
    [activeFormat],
  );

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 rounded-[28px] border border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-6 shadow-[0_30px_80px_-48px_rgba(15,23,42,0.45)]">
      <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <span className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[11px] font-semibold tracking-[0.2em] text-sky-700 uppercase">
              Editor Playground
            </span>
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                Explore formats, presets, and live output in one story
              </h2>
              <p className="max-w-3xl text-sm leading-6 text-slate-600">
                This showcase keeps each format sandbox isolated while surfacing
                the exact payload and reading stats the editor produces.
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-right">
            <div className="text-[11px] font-semibold tracking-[0.18em] text-slate-500 uppercase">
              Active Mode
            </div>
            <div className="mt-1 text-lg font-semibold text-slate-900">
              {FORMAT_LABELS[activeFormat]}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {(Object.keys(FORMAT_LABELS) as EditorFormat[]).map((format) => {
            const isActive = format === activeFormat;

            return (
              <button
                key={format}
                type="button"
                aria-pressed={isActive}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-slate-950 text-white shadow-lg shadow-slate-950/15"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
                onClick={() => setActiveFormat(format)}
              >
                {FORMAT_LABELS[format]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold tracking-[0.18em] text-slate-500 uppercase">
                  Presets
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  Load curated content for the current format without affecting
                  the other sandboxes.
                </p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {activePresets.map((preset) => (
                <button
                  key={`${activeFormat}-${preset.label}`}
                  type="button"
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-slate-300 hover:bg-slate-100"
                  onClick={() => applyPreset(preset)}
                >
                  <div className="text-sm font-semibold text-slate-900">
                    {preset.label}
                  </div>
                  <div className="mt-1 text-xs leading-5 text-slate-600">
                    {preset.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50/80 p-4">
            <div>
              <h3 className="text-sm font-semibold tracking-[0.18em] text-slate-500 uppercase">
                Story Controls
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Keep the playground focused with just the controls that change
                the editing experience the most.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={editable}
                  onChange={(event) => setEditable(event.target.checked)}
                />
                Editable
              </label>

              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={autoFocus}
                  onChange={(event) => setAutoFocus(event.target.checked)}
                />
                Auto focus
              </label>

              <label className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700">
                <span>Variant</span>
                <select
                  aria-label="Variant"
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none"
                  value={variant}
                  onChange={(event) =>
                    setVariant(event.target.value as EditorVariant)
                  }
                >
                  <option value="default">Default</option>
                  <option value="simple">Simple</option>
                  <option value="minimal">Minimal</option>
                </select>
              </label>

              <label className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 md:col-span-2 xl:col-span-1">
                <span>Placeholder</span>
                <input
                  aria-label="Placeholder"
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none"
                  type="text"
                  value={placeholder}
                  onChange={(event) => setPlaceholder(event.target.value)}
                />
              </label>
            </div>
          </div>

          <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
            <div className="flex items-center justify-between border-b border-slate-200 bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] px-5 py-4">
              <div>
                <h3 className="text-base font-semibold text-slate-950">
                  {FORMAT_LABELS[activeFormat]} editor canvas
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  Each format preserves its own content as you switch tabs.
                </p>
              </div>
              <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500">
                {editable ? "Editable" : "Read only"}
              </div>
            </div>
            <div className="bg-white p-5">
              <Editor
                key={`${activeFormat}:${activeEditorResetKey}`}
                autoFocus={autoFocus}
                editable={editable}
                format={activeFormat}
                onChange={updateActiveValue}
                onStatsChange={handleStatsChange}
                placeholder={placeholder}
                value={activeValue}
                variant={variant}
              />
            </div>
          </div>
        </div>

        <div className="space-y-6 rounded-3xl border border-slate-200 bg-slate-950 p-5 text-white shadow-sm">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold tracking-[0.18em] text-slate-300 uppercase">
              Reading Stats
            </h3>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs tracking-[0.18em] text-slate-400 uppercase">
                  Words
                </div>
                <div className="mt-2 text-2xl font-semibold text-white">
                  {activeStats.wordCount}
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs tracking-[0.18em] text-slate-400 uppercase">
                  Characters
                </div>
                <div className="mt-2 text-2xl font-semibold text-white">
                  {activeStats.characterCount}
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs tracking-[0.18em] text-slate-400 uppercase">
                  Reading Time
                </div>
                <div className="mt-2 text-2xl font-semibold text-white">
                  {activeStats.readingTimeMinutes} min
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-white">
                {outputTitle}
              </h3>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium tracking-[0.18em] text-slate-300 uppercase">
                {activeFormat === "html" ? "Cleaned" : "Live"}
              </span>
            </div>
            <p className="text-sm leading-6 text-slate-400">
              Inspect exactly what the current editor mode emits without leaving
              the story. HTML mode shows cleaned HTML output.
            </p>
            <pre
              aria-label="Serialized output"
              className="min-h-[320px] overflow-auto rounded-[24px] border border-white/10 bg-black/30 p-4 text-xs leading-6 text-slate-100"
            >
              {displayValue || "No content yet"}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
