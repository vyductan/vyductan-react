import { describe, expect, test } from "vitest";

import type { ChecklistItemSnapshot, SyncedRecord } from "./linked-checklist";
import { planPull, planPush } from "./linked-checklist";

const item = (
  key: string,
  title: string,
  linkedId: string | null = null,
  checked = false,
): ChecklistItemSnapshot => ({ key, title, linkedId, checked });

const agreed = (entries: [string, SyncedRecord][]): Map<string, SyncedRecord> =>
  new Map(entries);

describe("planPush", () => {
  test("files an item once the caret has left it", () => {
    const items = [item("a", "Buy milk"), item("b", "Call m")];
    const plan = planPush(items, new Map(), "b");
    expect(plan.create.map((entry) => entry.title)).toEqual(["Buy milk"]);
  });

  test("never files an empty item", () => {
    const plan = planPush([item("a", "")], new Map(), null);
    expect(plan.create).toEqual([]);
  });

  test("sends a tick at once, a retitle only after the caret leaves", () => {
    const synced = agreed([["t1", { title: "Buy milk", completed: false }]]);
    const edited = [item("a", "Buy oat milk", "t1", true)];

    expect(planPush(edited, synced, "a").update).toEqual([
      { id: "t1", patch: { completed: true } },
    ]);
    expect(planPush(edited, synced, null).update).toEqual([
      { id: "t1", patch: { completed: true, title: "Buy oat milk" } },
    ]);
  });

  test("an emptied item keeps its task's title", () => {
    const synced = agreed([["t1", { title: "Buy milk", completed: false }]]);
    const plan = planPush([item("a", "", "t1")], synced, null);
    expect(plan.update).toEqual([]);
  });

  test("sends nothing for a linked item not loaded yet", () => {
    const plan = planPush([item("a", "Buy milk", "t1", true)], new Map(), null);
    expect(plan).toEqual({ create: [], update: [] });
  });
});

describe("planPull", () => {
  test("a freshly opened document takes the task's state", () => {
    const plan = planPull(
      [item("a", "Buy milk", "t1", false)],
      [{ id: "t1", title: "Buy oat milk", completed: true }],
      new Map(),
      null,
    );
    expect(plan.set).toEqual([
      { key: "a", title: "Buy oat milk", checked: true },
    ]);
    expect(plan.synced.get("t1")).toEqual({
      title: "Buy oat milk",
      completed: true,
    });
  });

  test("keeps a local change the task did not make", () => {
    const synced = agreed([["t1", { title: "Buy milk", completed: false }]]);
    // Ticked here, not sent yet; the task is as last agreed.
    const plan = planPull(
      [item("a", "Buy milk", "t1", true)],
      [{ id: "t1", title: "Buy milk", completed: false }],
      synced,
      null,
    );
    expect(plan.set).toEqual([]);
  });

  test("does not retitle the item being written", () => {
    const synced = agreed([["t1", { title: "Buy milk", completed: false }]]);
    const plan = planPull(
      [item("a", "Buy m", "t1")],
      [{ id: "t1", title: "Buy bread", completed: true }],
      synced,
      "a",
    );
    expect(plan.set).toEqual([{ key: "a", checked: true }]);
  });

  test("a task still being filed is not mistaken for a deleted one", () => {
    const plan = planPull(
      [item("a", "Buy milk", "t1")],
      [{ id: "t1", title: "", completed: false, deleted: true }],
      new Map(),
      null,
      new Set(["t1"]),
    );
    expect(plan.unlink).toEqual([]);
  });

  test("a deleted task unlinks its item", () => {
    const synced = agreed([["t1", { title: "Buy milk", completed: false }]]);
    const plan = planPull(
      [item("a", "Buy milk", "t1")],
      [{ id: "t1", title: "", completed: false, deleted: true }],
      synced,
      null,
    );
    expect(plan.unlink).toEqual(["a"]);
    expect(plan.synced.has("t1")).toBe(false);
  });
});
