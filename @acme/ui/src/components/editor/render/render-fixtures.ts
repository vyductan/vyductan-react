import type {
  CanonicalEditorRenderFixtureName,
  EditorRenderContent,
  EditorRenderFixture,
  EditorRenderFixtureName,
  InvalidEditorRenderFixtureName,
  UnsupportedEditorRenderFixtureName,
} from "./render-types";

const createRoot = (children: EditorRenderContent["root"]["children"]): EditorRenderContent => ({
  root: {
    type: "root",
    direction: null,
    format: "",
    indent: 0,
    version: 1,
    children,
  },
});

const text = (value: string, format = 0) => ({
  detail: 0,
  format,
  mode: "normal",
  style: "",
  text: value,
  type: "text" as const,
  version: 1,
});

const linebreak = () => ({
  type: "linebreak" as const,
  version: 1,
});

const inlineCode = (value: string) => ({
  detail: 0,
  format: 16,
  mode: "normal",
  style: "",
  text: value,
  type: "text" as const,
  version: 1,
});

const codeHighlight = (value: string, highlightType: string | null) => ({
  detail: 0,
  format: 0,
  highlightType,
  mode: "normal",
  style: "",
  text: value,
  type: "code-highlight" as const,
  version: 1,
});

const paragraph = (...children: Array<ReturnType<typeof text> | ReturnType<typeof linebreak> | ReturnType<typeof inlineCode>>) => ({
  type: "paragraph" as const,
  direction: null,
  format: "",
  indent: 0,
  version: 1,
  children,
});

const heading = (tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6", content: string) => ({
  type: "heading" as const,
  tag,
  direction: null,
  format: "",
  indent: 0,
  version: 1,
  children: [text(content)],
});

const quote = (content: string) => ({
  type: "quote" as const,
  direction: null,
  format: "",
  indent: 0,
  version: 1,
  children: [text(content)],
});

const link = (type: "link" | "autolink", url: string, content: string) => ({
  type,
  url,
  rel: null,
  target: null,
  title: null,
  direction: null,
  format: "",
  indent: 0,
  version: 1,
  children: [text(content)],
});

const list = (
  listType: "bullet" | "number" | "check",
  tag: "ul" | "ol",
  items: Array<ReturnType<typeof listItem>>,
) => ({
  type: "list" as const,
  listType,
  start: 1,
  tag,
  direction: null,
  format: "",
  indent: 0,
  version: 1,
  children: items,
});

function listItem(
  content: Array<ReturnType<typeof paragraph> | ReturnType<typeof list>>,
  options?: { checked?: boolean; value?: number },
) {
  return {
    type: "listitem" as const,
    value: options?.value ?? 1,
    checked: options?.checked,
    direction: null,
    format: "",
    indent: 0,
    version: 1,
    children: content,
  };
}

const checkBlock = (checked: boolean, content: string) => ({
  type: "check-block" as const,
  checked,
  direction: null,
  format: "",
  indent: 0,
  version: 1,
  children: [text(content)],
});

const codeBlock = (language: string | null, content: string) => ({
  type: "code" as const,
  language,
  direction: null,
  format: "",
  indent: 0,
  version: 1,
  children: [codeHighlight(content, language)],
});

const horizontalRule = () => ({
  type: "horizontalrule" as const,
  version: 1,
});

const tableCell = (content: string, headerState = 0) => ({
  type: "tablecell" as const,
  backgroundColor: null,
  colSpan: 1,
  rowSpan: 1,
  headerState,
  direction: null,
  format: "",
  indent: 0,
  version: 1,
  children: [paragraph(text(content))],
});

const tableRow = (...children: Array<ReturnType<typeof tableCell>>) => ({
  type: "tablerow" as const,
  direction: null,
  format: "",
  indent: 0,
  version: 1,
  children,
});

const table = (...children: Array<ReturnType<typeof tableRow>>) => ({
  type: "table" as const,
  direction: null,
  format: "",
  indent: 0,
  version: 1,
  children,
});

const unsupportedRoot = (type: string) => ({
  root: {
    type: "root",
    direction: null,
    format: "",
    indent: 0,
    version: 1,
    children: [
      {
        type,
        direction: null,
        format: "",
        indent: 0,
        version: 1,
        children: [paragraph(text("Unsupported descendant text should not be salvaged."))],
      },
    ],
  },
});

const canonicalFixtures = {
  paragraph: createRoot([paragraph(text("Canonical paragraph content."))]),
  heading: createRoot([heading("h2", "Canonical heading content")]),
  quote: createRoot([quote("Canonical quote content.")]),
  link: createRoot([paragraph(link("link", "https://example.com", "Canonical link"))]),
  autolink: createRoot([
    paragraph(link("autolink", "https://example.com/autolink", "https://example.com/autolink")),
  ]),
  bulletList: createRoot([
    list("bullet", "ul", [
      listItem([paragraph(text("First bullet"))]),
      listItem([
        paragraph(text("Second bullet")),
        list("bullet", "ul", [listItem([paragraph(text("Nested bullet"))])]),
      ]),
    ]),
  ]),
  numberList: createRoot([
    list("number", "ol", [
      listItem([paragraph(text("First item"))], { value: 1 }),
      listItem([paragraph(text("Second item"))], { value: 2 }),
    ]),
  ]),
  checkList: createRoot([
    list("check", "ul", [
      listItem([paragraph(text("Unchecked checklist item"))], { checked: false }),
      listItem([paragraph(text("Checked checklist item"))], { checked: true }),
    ]),
  ]),
  checkBlock: createRoot([
    checkBlock(false, "Unchecked check block"),
    checkBlock(true, "Checked check block"),
  ]),
  codeBlock: createRoot([codeBlock("typescript", "const answer = 42;")]),
  horizontalRule: createRoot([horizontalRule()]),
  table: createRoot([
    table(
      tableRow(tableCell("Header A", 1), tableCell("Header B", 1)),
      tableRow(tableCell("Cell A1"), tableCell("Cell B1")),
    ),
  ]),
  formattedText: createRoot([
    paragraph(text("Bold", 1), text(" italic", 2), text(" underline", 8), text(" plain")),
  ]),
  inlineCode: createRoot([paragraph(text("Prefix "), inlineCode("const value = 1"), text(" suffix"))]),
  softBreak: createRoot([paragraph(text("Line one"), linebreak(), text("Line two"))]),
} satisfies Record<CanonicalEditorRenderFixtureName, EditorRenderContent>;

const unsupportedFixtures = {
  image: unsupportedRoot("image"),
  video: unsupportedRoot("video"),
  fileAttachment: unsupportedRoot("file-attachment"),
  equation: unsupportedRoot("equation"),
  poll: unsupportedRoot("poll"),
  toc: unsupportedRoot("toc"),
  layout: {
    root: {
      type: "root",
      direction: null,
      format: "",
      indent: 0,
      version: 1,
      children: [
        {
          type: "layout-container",
          direction: null,
          format: "",
          indent: 0,
          version: 1,
          children: [
            {
              type: "layout-item",
              direction: null,
              format: "",
              indent: 0,
              version: 1,
              children: [paragraph(text("Unsupported layout item text."))],
            },
          ],
        },
      ],
    },
  },
  collapsible: {
    root: {
      type: "root",
      direction: null,
      format: "",
      indent: 0,
      version: 1,
      children: [
        {
          type: "collapsible-container",
          direction: null,
          format: "",
          indent: 0,
          version: 1,
          children: [
            {
              type: "collapsible-title",
              direction: null,
              format: "",
              indent: 0,
              version: 1,
              children: [paragraph(text("Unsupported title"))],
            },
            {
              type: "collapsible-content",
              direction: null,
              format: "",
              indent: 0,
              version: 1,
              children: [paragraph(text("Unsupported body"))],
            },
          ],
        },
      ],
    },
  },
  embed: unsupportedRoot("youtube"),
  mention: unsupportedRoot("mention"),
  hashtag: unsupportedRoot("hashtag"),
  keyword: unsupportedRoot("keyword"),
  autocomplete: unsupportedRoot("autocomplete"),
  pageBreak: unsupportedRoot("page-break"),
} satisfies Record<UnsupportedEditorRenderFixtureName, unknown>;

const invalidFixtures = {
  invalidJson: {
    content: "not valid json",
    serialized: "not valid json",
  },
  invalidShape: {
    content: {
      root: {
        type: "root",
        direction: null,
        format: "",
        indent: 0,
        version: 1,
        children: [{ text: "missing required text node fields" }],
      },
    },
    serialized: JSON.stringify({
      root: {
        type: "root",
        direction: null,
        format: "",
        indent: 0,
        version: 1,
        children: [{ text: "missing required text node fields" }],
      },
    }),
  },
} satisfies Record<InvalidEditorRenderFixtureName, EditorRenderFixture>;

export const canonicalEditorRenderFixtureNames = [
  "paragraph",
  "heading",
  "quote",
  "link",
  "autolink",
  "bulletList",
  "numberList",
  "checkList",
  "checkBlock",
  "codeBlock",
  "horizontalRule",
  "table",
  "formattedText",
  "inlineCode",
  "softBreak",
] as const satisfies readonly CanonicalEditorRenderFixtureName[];

export const unsupportedEditorRenderFixtureNames = [
  "image",
  "video",
  "fileAttachment",
  "equation",
  "poll",
  "toc",
  "layout",
  "collapsible",
  "embed",
  "mention",
  "hashtag",
  "keyword",
  "autocomplete",
  "pageBreak",
] as const satisfies readonly UnsupportedEditorRenderFixtureName[];

export const invalidEditorRenderFixtureNames = [
  "invalidJson",
  "invalidShape",
] as const satisfies readonly InvalidEditorRenderFixtureName[];

const canonicalFixtureEntries = Object.entries(canonicalFixtures).map(([name, content]) => [
  name,
  {
    content,
    serialized: JSON.stringify(content),
  } satisfies EditorRenderFixture<EditorRenderContent>,
]);

const unsupportedFixtureEntries = Object.entries(unsupportedFixtures).map(([name, content]) => [
  name,
  {
    content,
    serialized: JSON.stringify(content),
  } satisfies EditorRenderFixture,
]);

export const editorRenderFixtures = Object.fromEntries([
  ...canonicalFixtureEntries,
  ...unsupportedFixtureEntries,
  ...Object.entries(invalidFixtures),
]) as Record<EditorRenderFixtureName, EditorRenderFixture>;
