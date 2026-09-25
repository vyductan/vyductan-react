/**
 * Checklist items linked to records outside the document (a journal's to-dos
 * that are also tasks). The link is the record id, kept on the item as
 * NodeState; this module holds the rules for keeping the two sides in step,
 * as plain functions over snapshots so they can be tested without an editor.
 */
import type { NodeKey } from "lexical";
import { createState } from "lexical";

/** The linked record's id, on a checklist item. Serialized under `$`. */
export const linkedItemState = createState("linkedId", {
  parse: (value) => (typeof value === "string" && value !== "" ? value : null),
});

/** One checklist item of the linked section, as the editor has it. */
export interface ChecklistItemSnapshot {
  key: NodeKey;
  linkedId: string | null;
  title: string;
  checked: boolean;
}

/** A linked record as its owner has it. */
export interface LinkedRecord {
  id: string;
  title: string;
  completed: boolean;
  /** Asked for and not found: the record was deleted on its side. */
  deleted?: boolean;
}

/** What both sides last agreed on, per record id. */
export interface SyncedRecord {
  title: string;
  completed: boolean;
}

export interface PushPlan {
  create: ChecklistItemSnapshot[];
  update: {
    id: string;
    patch: { title?: string; completed?: boolean };
  }[];
}

/**
 * Local changes to send out.
 *
 * The item the caret is in is still being written: it is not created, and its
 * title is not sent, until the caret leaves — otherwise every pause mid-word
 * would file a task named after half a word. A tick is sent at once, caret or
 * not. A linked item emptied of text keeps its record's title.
 */
export function planPush(
  items: readonly ChecklistItemSnapshot[],
  synced: ReadonlyMap<string, SyncedRecord>,
  activeKey: NodeKey | null,
  pending: ReadonlySet<NodeKey>,
): PushPlan {
  const plan: PushPlan = { create: [], update: [] };
  for (const item of items) {
    const editing = item.key === activeKey;
    if (item.linkedId === null) {
      if (item.title !== "" && !editing && !pending.has(item.key)) {
        plan.create.push(item);
      }
      continue;
    }
    // Not loaded yet: nothing to compare against, and pushing blind would
    // overwrite whatever changed on the other side meanwhile.
    const agreed = synced.get(item.linkedId);
    if (!agreed) continue;
    const patch: { title?: string; completed?: boolean } = {};
    if (item.checked !== agreed.completed) patch.completed = item.checked;
    if (!editing && item.title !== "" && item.title !== agreed.title) {
      patch.title = item.title;
    }
    if (Object.keys(patch).length > 0) {
      plan.update.push({ id: item.linkedId, patch });
    }
  }
  return plan;
}

export interface PullPlan {
  /** Items whose record is gone: they become plain checklist items. */
  unlink: NodeKey[];
  set: { key: NodeKey; title?: string; checked?: boolean }[];
  /** The new agreed state, for every record that came back. */
  synced: Map<string, SyncedRecord>;
}

/**
 * Remote changes to bring in.
 *
 * A field is taken from the record when the record changed it since the last
 * agreement (or there is no agreement yet — a freshly opened document defers
 * to the records). A field only the document changed is left for `planPush`.
 * When both changed, the record wins, except for the title of the item being
 * written, which is not rewritten under the caret.
 */
export function planPull(
  items: readonly ChecklistItemSnapshot[],
  records: readonly LinkedRecord[],
  synced: ReadonlyMap<string, SyncedRecord>,
  activeKey: NodeKey | null,
): PullPlan {
  const plan: PullPlan = { unlink: [], set: [], synced: new Map(synced) };
  const byId = new Map(records.map((record) => [record.id, record]));
  for (const item of items) {
    if (item.linkedId === null) continue;
    const record = byId.get(item.linkedId);
    if (!record) continue;
    if (record.deleted) {
      plan.unlink.push(item.key);
      plan.synced.delete(record.id);
      continue;
    }
    const agreed = synced.get(record.id);
    const change: { key: NodeKey; title?: string; checked?: boolean } = {
      key: item.key,
    };
    if (
      (!agreed || record.title !== agreed.title) &&
      item.title !== record.title &&
      item.key !== activeKey
    ) {
      change.title = record.title;
    }
    if (
      (!agreed || record.completed !== agreed.completed) &&
      item.checked !== record.completed
    ) {
      change.checked = record.completed;
    }
    if (change.title !== undefined || change.checked !== undefined) {
      plan.set.push(change);
    }
    plan.synced.set(record.id, {
      title: record.title,
      completed: record.completed,
    });
  }
  return plan;
}
