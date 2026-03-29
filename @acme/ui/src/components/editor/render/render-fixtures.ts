import type {
  CanonicalEditorRenderFixtureName,
  EditorRenderContent,
  EditorRenderFixture,
  EditorRenderFixtureName,
  EditorRenderInlineNode,
  EditorRenderLinkNode,
  EditorRenderListItemNode,
  EditorRenderListNode,
  EditorRenderParagraphNode,
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

const paragraph = (...children: EditorRenderInlineNode[]): EditorRenderParagraphNode => ({
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

const link = (type: "link" | "autolink", url: string, content: string): EditorRenderLinkNode => ({
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

function list(
  listType: "bullet" | "number" | "check",
  tag: "ul" | "ol",
  items: EditorRenderListItemNode[],
): EditorRenderListNode {
  return {
    type: "list" as const,
    listType,
    start: 1,
    tag,
    direction: null,
    format: "",
    indent: 0,
    version: 1,
    children: items,
  };
}

function listItem(
  content: Array<EditorRenderParagraphNode | EditorRenderListNode>,
  options?: { checked?: boolean; value?: number },
): EditorRenderListItemNode {
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

export const editorRenderSourceFixtures = {
  paragraph: {
    markdown: "Canonical paragraph content.",
    html: "<p>Canonical paragraph content.</p>",
  },
  heading: {
    markdown: "## Canonical heading content",
    html: "<h2>Canonical heading content</h2>",
  },
  headingParagraph: {
    markdown: "## Canonical heading content\n\nCanonical paragraph content.",
    html: "<h2>Canonical heading content</h2><p>Canonical paragraph content.</p>",
  },
  link: {
    markdown: "[Canonical link](https://example.com)",
    html: '<p><a href="https://example.com">Canonical link</a></p>',
  },
  bulletList: {
    markdown: "- First bullet\n- Second bullet\n    - Nested bullet",
    html: "<ul><li>First bullet</li><li>Second bullet<ul><li>Nested bullet</li></ul></li></ul>",
  },
  blockquote: {
    html: "<blockquote><p>Canonical quote content.</p></blockquote>",
  },
  blockquoteParagraphs: {
    html: "<blockquote><p>First quote paragraph.</p><p>Second quote paragraph.</p></blockquote>",
  },
  checkBlock: {
    markdown: "- [ ] Unchecked check block\n- [x] Checked check block",
  },
  codeBlock: {
    markdown: "```typescript\nconst answer = 42;\n```",
    html: "<pre><code>const answer = 42;</code></pre>",
  },
  table: {
    markdown:
      "| Header A | Header B |\n| --- | --- |\n| Cell A1 | Cell B1 |",
    html:
      "<table><thead><tr><th>Header A</th><th>Header B</th></tr></thead><tbody><tr><td>Cell A1</td><td>Cell B1</td></tr></tbody></table>",
  },
  horizontalRule: {
    markdown: "Paragraph before\n\n---\n\nParagraph after",
    html: "<p>Paragraph before</p><hr><p>Paragraph after</p>",
  },
  unsupportedImage: {
    markdown: "![Unsupported image](https://example.com/image.png)",
    html: '<img src="https://example.com/image.png" alt="Unsupported image" />',
  },
} as const;

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

function serializeFixtures<TName extends string, TContent>(
  fixtures: Record<TName, TContent>,
): Record<TName, EditorRenderFixture<TContent>> {
  const serializedFixtures = {} as Record<TName, EditorRenderFixture<TContent>>;

  for (const name of Object.keys(fixtures) as TName[]) {
    const content = fixtures[name];
    serializedFixtures[name] = {
      content,
      serialized: JSON.stringify(content),
    };
  }

  return serializedFixtures;
}

const canonicalEditorRenderFixtures = serializeFixtures(canonicalFixtures);
const unsupportedEditorRenderFixtures = serializeFixtures(unsupportedFixtures);

export const editorRenderFixtures = {
  ...canonicalEditorRenderFixtures,
  ...unsupportedEditorRenderFixtures,
  ...invalidFixtures,
} satisfies Record<EditorRenderFixtureName, EditorRenderFixture>;
