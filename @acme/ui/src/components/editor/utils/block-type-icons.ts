import type { LucideIcon } from "lucide-react";
import {
  CodeIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  ListIcon,
  ListOrderedIcon,
  ListTodoIcon,
  QuoteIcon,
  TextIcon,
} from "lucide-react";

/**
 * The icon each block type is shown with, wherever a type is picked — the
 * block menu's Turn into and the toolbar's type menu — matching the slash
 * menu's, so a type looks the same everywhere it is chosen.
 */
export const BLOCK_TYPE_ICONS = {
  paragraph: TextIcon,
  h1: Heading1Icon,
  h2: Heading2Icon,
  h3: Heading3Icon,
  bullet: ListIcon,
  number: ListOrderedIcon,
  check: ListTodoIcon,
  code: CodeIcon,
  quote: QuoteIcon,
} as const satisfies Record<string, LucideIcon>;
