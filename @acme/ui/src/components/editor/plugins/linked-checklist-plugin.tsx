"use client";

import type { LexicalEditor, LexicalNode, NodeKey } from "lexical";
import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { $isListItemNode, $isListNode } from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $isHeadingNode } from "@lexical/rich-text";
import { $dfs, $findMatchingParent, mergeRegister } from "@lexical/utils";
import {
  $createTextNode,
  $getNodeByKey,
  $getRoot,
  $getSelection,
  $getState,
  $isRangeSelection,
  $setState,
  HISTORY_MERGE_TAG,
} from "lexical";

import type {
  ChecklistItemSnapshot,
  LinkedRecord,
  SyncedRecord,
} from "../utils/linked-checklist";
import { $isCheckBlockNode } from "../nodes/check-block-node";
import { linkedItemState, planPull, planPush } from "../utils/linked-checklist";
import { $isNestedListHolder } from "../utils/list-marker";

export type { LinkedRecord } from "../utils/linked-checklist";

export interface LinkedChecklistPluginProps {
  /** Whether a heading with this text opens the linked section. */
  isSectionHeading: (text: string) => boolean;
  /**
   * The linked records as their owner has them, one per id last reported
   * through `onLinkedIdsChange` (`deleted` for one that no longer exists).
   * Undefined while loading. A new array brings its changes into the document.
   */
  records: readonly LinkedRecord[] | undefined;
  /** The ids the section links to, whenever that set changes. */
  onLinkedIdsChange: (ids: string[]) => void;
  /** File a record for a new item; resolves to its id. */
  createRecord: (draft: {
    title: string;
    completed: boolean;
  }) => Promise<string>;
  updateRecord: (
    id: string,
    patch: { title?: string; completed?: boolean },
  ) => void;
  /** Quiet time after an edit before it is sent. */
  debounceMs?: number;
}

/** A checklist item: a check-block, or an item of a `check` list. */
function isChecklistItem(node: LexicalNode): boolean {
  if ($isCheckBlockNode(node)) return true;
  if (!$isListItemNode(node) || $isNestedListHolder(node)) return false;
  const list = node.getParent();
  return $isListNode(list) && list.getListType() === "check";
}

function $isChecked(node: LexicalNode): boolean {
  if ($isCheckBlockNode(node)) return node.getChecked();
  return $isListItemNode(node) && node.getChecked() === true;
}

/**
 * The checklist items under the section heading, down to the next heading.
 * A record linked from two items (a copied line) keeps only the first; the
 * copy is reported in `duplicates` to be unlinked and filed on its own.
 */
function $collectSection(isSectionHeading: (text: string) => boolean): {
  items: ChecklistItemSnapshot[];
  duplicates: NodeKey[];
} {
  const items: ChecklistItemSnapshot[] = [];
  const duplicates: NodeKey[] = [];
  const seen = new Set<string>();
  let inSection = false;
  for (const block of $getRoot().getChildren()) {
    if ($isHeadingNode(block)) {
      inSection = isSectionHeading(block.getTextContent().trim());
      continue;
    }
    if (!inSection) continue;
    const candidates = $isListNode(block)
      ? $dfs(block).map(({ node }) => node)
      : [block];
    for (const node of candidates) {
      if (!isChecklistItem(node)) continue;
      let linkedId = $getState(node, linkedItemState);
      if (linkedId !== null && seen.has(linkedId)) {
        duplicates.push(node.getKey());
        linkedId = null;
      }
      if (linkedId !== null) seen.add(linkedId);
      items.push({
        key: node.getKey(),
        linkedId,
        title: node.getTextContent().trim(),
        checked: $isChecked(node),
      });
    }
  }
  return { items, duplicates };
}

function isFocused(editor: LexicalEditor): boolean {
  const root = editor.getRootElement();
  return root !== null && root.contains(document.activeElement);
}

/** The checklist item the caret is in, while the editor has focus. */
function $activeItemKey(focused: boolean): NodeKey | null {
  if (!focused) return null;
  const selection = $getSelection();
  if (!$isRangeSelection(selection)) return null;
  const item = $findMatchingParent(selection.anchor.getNode(), isChecklistItem);
  return item?.getKey() ?? null;
}

/**
 * Keeps the checklist items of one section in step with outside records — a
 * journal's "Todo" section with tasks — both ways:
 *
 * - an item gets a record once the caret leaves it, and remembers its id;
 * - ticking an item or retitling it updates the record;
 * - a record ticked, retitled or deleted elsewhere shows up in the item when
 *   `records` next changes (the host refetches, e.g. on window focus).
 *
 * Deleting an item only drops the link: the record stays. The host owns
 * fetching and writing; this plugin owns the document and the rules (see
 * ../utils/linked-checklist).
 */
export function LinkedChecklistPlugin(props: LinkedChecklistPluginProps): null {
  const [editor] = useLexicalComposerContext();
  const latest = useRef(props);
  useLayoutEffect(() => {
    latest.current = props;
  });

  const synced = useRef(new Map<string, SyncedRecord>());
  const pending = useRef(new Set<NodeKey>());
  const reportedIds = useRef<string | null>(null);

  const applyRecords = useCallback(
    (records: readonly LinkedRecord[]) => {
      editor.update(
        () => {
          const { items } = $collectSection(latest.current.isSectionHeading);
          const plan = planPull(
            items,
            records,
            synced.current,
            $activeItemKey(isFocused(editor)),
          );
          synced.current = plan.synced;
          for (const key of plan.unlink) {
            const node = $getNodeByKey(key);
            if (node) $setState(node, linkedItemState, null);
          }
          for (const { key, title, checked } of plan.set) {
            const node = $getNodeByKey(key);
            if (!$isCheckBlockNode(node) && !$isListItemNode(node)) continue;
            if (checked !== undefined) node.setChecked(checked);
            if (title !== undefined) {
              node.clear().append($createTextNode(title));
            }
          }
        },
        { tag: HISTORY_MERGE_TAG },
      );
    },
    [editor],
  );

  // Local → records.
  useEffect(() => {
    const push = () => {
      const { isSectionHeading, onLinkedIdsChange } = latest.current;
      const { items, duplicates, activeKey } = editor
        .getEditorState()
        .read(() => ({
          ...$collectSection(isSectionHeading),
          activeKey: $activeItemKey(isFocused(editor)),
        }));

      const ids = items
        .map((item) => item.linkedId)
        .filter((id): id is string => id !== null)
        .sort();
      const idsKey = ids.join(",");
      if (idsKey !== reportedIds.current) {
        reportedIds.current = idsKey;
        onLinkedIdsChange(ids);
        // Items that came into the document after the last fetch (a paste,
        // content set after mount) take what that fetch already knows. Only
        // records not yet agreed on: for the rest the fetch may predate a
        // change just sent, and would undo it.
        const linked = new Set(ids);
        const unseen = latest.current.records?.filter(
          (record) => linked.has(record.id) && !synced.current.has(record.id),
        );
        if (unseen && unseen.length > 0) {
          applyRecords(unseen);
          // Scheduled rather than left to the update listener: an update
          // that changes nothing never reaches it.
          schedule();
          return;
        }
      }

      if (duplicates.length > 0) {
        // The update this makes runs push again, with the copies unlinked.
        editor.update(
          () => {
            for (const key of duplicates) {
              const node = $getNodeByKey(key);
              if (node) $setState(node, linkedItemState, null);
            }
          },
          { tag: HISTORY_MERGE_TAG },
        );
        return;
      }

      const plan = planPush(items, synced.current, activeKey, pending.current);
      for (const item of plan.create) {
        pending.current.add(item.key);
        latest.current
          .createRecord({ title: item.title, completed: item.checked })
          .then((id) => {
            synced.current.set(id, {
              title: item.title,
              completed: item.checked,
            });
            // Merged into the edit before it: undo takes the line back, not
            // just its link — a bare unlink would file it again at once.
            editor.update(
              () => {
                const node = $getNodeByKey(item.key);
                if (node) $setState(node, linkedItemState, id);
              },
              { tag: HISTORY_MERGE_TAG },
            );
          })
          // Left unlinked; the next edit tries again.
          .catch(() => undefined)
          .finally(() => pending.current.delete(item.key));
      }
      for (const { id, patch } of plan.update) {
        const agreed = synced.current.get(id);
        if (agreed) synced.current.set(id, { ...agreed, ...patch });
        latest.current.updateRecord(id, patch);
      }
    };

    let timer: ReturnType<typeof setTimeout> | undefined;
    const schedule = () => {
      clearTimeout(timer);
      timer = setTimeout(push, latest.current.debounceMs ?? 600);
    };
    // focusout fires before focus moves on; wait for activeElement.
    const onFocusOut = () => queueMicrotask(push);

    return mergeRegister(
      editor.registerUpdateListener(schedule),
      editor.registerRootListener((root, previousRoot) => {
        previousRoot?.removeEventListener("focusout", onFocusOut);
        root?.addEventListener("focusout", onFocusOut);
      }),
      () => {
        clearTimeout(timer);
        editor.getRootElement()?.removeEventListener("focusout", onFocusOut);
      },
    );
  }, [editor, applyRecords]);

  // Records → local, each time the host hands over a new fetch.
  const { records } = props;
  useEffect(() => {
    if (records) applyRecords(records);
  }, [records, applyRecords]);

  return null;
}
