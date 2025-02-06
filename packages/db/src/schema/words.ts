import { pgEnum, text, timestamp } from "drizzle-orm/pg-core";

import { pgTable } from "..";

/*
 * Word
 */
export const WordClassEnum = pgEnum("wordClass", [
  "",
  "noun",
  "verb",
  "adj",
  "adv",
  "phrase",
]);

export const CefrLevelEnum = pgEnum("cefrLevel", [
  "",
  "a1",
  "a2",
  "b1",
  "b2",
  "c1",
  "c2",
]);
export const WordMasteryEnum = pgEnum("mastery", ["1", "2", "3", "4", "5"]);

export const WordsTable = pgTable("words", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  word: text("word").notNull(),
  cambridgeUrl: text("cambridge_url"),
  cefrLevel: CefrLevelEnum("cefr_level"),
  pos: WordClassEnum("pos"),
  gram: text("gram"),
  ipaUk: text("ipa_uk"),
  ipaUs: text("ipa_us"),
  definition: text("definition"),
  translation: text("translation"),
  relatedWords: text("related_words"),
  examples: text("examples").array(),
  mastery: WordMasteryEnum("mastery"),
  lastLearnedAt: timestamp("last_learned_at").defaultNow(),
});
