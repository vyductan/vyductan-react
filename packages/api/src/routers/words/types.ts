import type { CefrLevelEnum, WordClassEnum, WordMasteryEnum } from "@acme/db/schema";

export type WordClass = (typeof WordClassEnum.enumValues)[number];
export type WordCEFRLevel = (typeof CefrLevelEnum.enumValues)[number];
export type WordMastery = (typeof WordMasteryEnum.enumValues)[number];
