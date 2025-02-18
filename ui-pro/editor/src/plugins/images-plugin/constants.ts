import type { LexicalCommand } from "lexical";
import { createCommand } from "lexical";

import type { InsertImagePayload } from "./types";

export const INSERT_IMAGE_COMMAND: LexicalCommand<InsertImagePayload> =
  createCommand("INSERT_IMAGE_COMMAND");
