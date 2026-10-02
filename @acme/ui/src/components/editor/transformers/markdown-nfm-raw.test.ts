import { describe, expect, test } from "vitest";

import {
  lexicalContentToMarkdown,
  markdownToLexicalContent,
} from "../utils/lexical-converter";

/**
 * Notion-flavored Markdown the editor does not model — child pages,
 * databases, Notion's HTML-ish tables, columns, synced blocks, media,
 * mentions, colored spans — is kept byte for byte, as a read-only chip, so
 * editing the text around it can never rewrite it on its way back to Notion.
 * https://developers.notion.com/guides/data-apis/enhanced-markdown
 */

interface JsonNode {
  type?: string;
  text?: string;
  markup?: string;
  children?: JsonNode[];
}

const topLevel = (markdown: string) =>
  (markdownToLexicalContent(markdown).root as JsonNode).children ?? [];

const roundTrip = (markdown: string) =>
  lexicalContentToMarkdown(markdownToLexicalContent(markdown));

describe("Notion-only blocks", () => {
  for (const [name, markup] of [
    ["a child page", '<page url="https://www.notion.so/abc">Child page</page>'],
    [
      "a database",
      '<database url="https://www.notion.so/db" inline="true">Tasks</database>',
    ],
    [
      "an unreadable block",
      '<unknown url="https://www.notion.so/x#b" alt="ai_block"/>',
    ],
    ["an empty block", "<empty-block/>"],
    ["a table of contents", '<table_of_contents color="gray"/>'],
    ["a video", '<video src="https://example.com/v.mp4">Caption</video>'],
    // A plain one becomes an editable table (markdown-nfm-table.test.ts);
    // one with colors has nowhere to keep them, so it stays raw.
    [
      "a Notion table with colors",
      '<table header-row="true">\n\t<tr color="blue_bg">\n\t\t<td>a</td>\n\t\t<td>b</td>\n\t</tr>\n</table>',
    ],
    // Bare columns read into the editor's layout (markdown-nfm-columns.test.ts).
    [
      "columns with attributes",
      '<columns>\n\t<column width="0.4">\n\t\tLeft\n\t</column>\n\t<column>\n\t\tRight\n\t</column>\n</columns>',
    ],
    [
      "a synced block",
      '<synced_block url="https://www.notion.so/s">\n\tShared text\n</synced_block>',
    ],
  ] as const) {
    test(`keeps ${name} as one raw block, byte for byte`, () => {
      const markdown = `Before\n\n${markup}\n\nAfter`;
      expect(
        topLevel(markdown).map(({ type, markup: raw }) => ({ type, raw })),
      ).toStrictEqual([
        { type: "paragraph", raw: undefined },
        { type: "nfm-raw-block", raw: markup },
        { type: "paragraph", raw: undefined },
      ]);
      expect(roundTrip(markdown)).toBe(markdown);
    });
  }

  test("keeps a raw block inside a callout at its depth", () => {
    const markdown =
      '<callout icon="💡">\n\tSee\n\n\t<page url="https://www.notion.so/abc">Child</page>\n</callout>';
    const [callout] = topLevel(markdown);
    expect(callout?.children?.map(({ type }) => type)).toStrictEqual([
      "paragraph",
      "nfm-raw-block",
    ]);
    expect(roundTrip(markdown)).toBe(markdown);
  });
});

describe("Notion-only inline markup", () => {
  for (const [name, markup] of [
    ["a user mention", '<mention-user url="user://1">Tân</mention-user>'],
    [
      "a page mention",
      '<mention-page url="https://www.notion.so/p">Plan</mention-page>',
    ],
    ["a date mention", '<mention-date start="2026-10-02"/>'],
    // A plain colored or underlined span is editable text now
    // (markdown-nfm-colors.test.ts); one with markdown inside stays raw.
    ["a colored span with markdown inside", '<span color="red">**hot**</span>'],
    ["a span in a color Notion lacks", '<span color="teal">odd</span>'],
  ] as const) {
    test(`keeps ${name} as a raw inline chip in its line`, () => {
      const markdown = `Ask ${markup} today`;
      const [paragraph] = topLevel(markdown);
      expect(
        (paragraph?.children ?? []).map(({ type, text, markup: raw }) => ({
          type,
          text,
          raw,
        })),
      ).toStrictEqual([
        { type: "text", text: "Ask ", raw: undefined },
        { type: "nfm-raw-inline", text: undefined, raw: markup },
        { type: "text", text: " today", raw: undefined },
      ]);
      expect(roundTrip(markdown)).toBe(markdown);
    });
  }

  test("keeps two in one line", () => {
    const markdown =
      'Ping <mention-user url="user://1">A</mention-user> and <mention-user url="user://2">B</mention-user>.';
    const [paragraph] = topLevel(markdown);
    expect(
      paragraph?.children?.filter(({ type }) => type === "nfm-raw-inline"),
    ).toHaveLength(2);
    expect(roundTrip(markdown)).toBe(markdown);
  });
});

describe("nested lists indent with tabs, as Notion writes them", () => {
  test("reads tab-indented items as nested lists", () => {
    const [list] = topLevel("- a\n\t- b\n\t\t- c");
    const json = JSON.stringify(list);
    expect(json).toContain('"text":"a"');
    expect((json.match(/"type":"list"/g) ?? []).length).toBe(3);
  });

  test("writes nested items back with tabs", () => {
    const markdown = "- a\n\t- b\n\t\t- c\n- d";
    expect(roundTrip(markdown)).toBe(markdown);
  });
});
