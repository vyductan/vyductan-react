import type { LinkNode } from "@lexical/link";
import { $createLinkNode } from "@lexical/link";
import { $createTextNode } from "lexical";

/** Used when the host names a page but offers no icon of its own. */
export const DEFAULT_PAGE_ICON = "📄";

export type PageLinkTarget = {
  url: string;
  title: string;
  /**
   * A short glyph, not an image URL. A link's text can only carry text, and a
   * glyph round-trips through every format the editor supports.
   */
  icon?: string;
};

/**
 * The text a page link reads as. One function, because every menu that offers
 * a page link promises this string and the document has to receive exactly it.
 */
export function pageLinkLabel({
  title,
  icon,
}: Pick<PageLinkTarget, "title" | "icon">): string {
  return `${icon ?? DEFAULT_PAGE_ICON} ${title}`;
}

/**
 * A link to another page, rendered as a pill.
 *
 * Deliberately a plain LinkNode marked `rel="mention"`, not a node type of its
 * own: the published-render boundary rejects a whole document that contains a
 * `mention` node, while a link's serialized shape already carries `rel` and
 * every renderer already writes it onto the anchor. "Paste as → Mention" and
 * the @ menu's "Link to page" both build it here so the two cannot drift.
 */
export function $createPageLinkNode(target: PageLinkTarget): LinkNode {
  const link = $createLinkNode(target.url, { rel: "mention" });
  link.append($createTextNode(pageLinkLabel(target)));
  return link;
}
