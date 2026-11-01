import { describe, expect, test } from "vitest";

import {
  lexicalContentToMarkdown,
  markdownToLexicalContent,
} from "../utils/lexical-converter";

const roundTrip = (markdown: string) =>
  lexicalContentToMarkdown(markdownToLexicalContent(markdown));

/**
 * An underscore inside a word cannot start emphasis in markdown, so it needs
 * no backslash. Lexical wrote one before every underscore: each save turned
 * `booking_id` into `booking\_id` across a file — in its tables too.
 */
describe("an underscore inside a word is written as it is", () => {
  test.each([
    "booking_id and snake_case_name",
    "- item booking_id",
    "| A | B |\n| --- | --- |\n| x | booking_id |",
    "| A | B |\n| --- | --- |\n| x | a<br>booking_id |",
    "**fn_create_booking** here",
  ])("%j", (markdown) => {
    expect(roundTrip(markdown)).toBe(markdown);
  });

  test("one that could start or end emphasis keeps its backslash", () => {
    expect(roundTrip(String.raw`\_lead and trail\_ and a \_ b`)).toBe(
      String.raw`\_lead and trail\_ and a \_ b`,
    );
  });

  test("code keeps what it has", () => {
    expect(roundTrip("`a_b` and `c\\_d`")).toBe("`a_b` and `c\\_d`");
  });
});
