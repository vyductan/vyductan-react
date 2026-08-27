import { describe, expect, it } from "vitest";

import type { AgendaEvent } from "./types";
import { clipToDay, dayFraction, layoutOverlaps, occursOn } from "./layout";

const at = (hour: number, minute = 0) => new Date(2026, 0, 5, hour, minute);

const event = (id: string, startHour: number, endHour: number): AgendaEvent => ({
  id,
  title: id,
  start: at(startHour),
  end: at(endHour),
});

describe("layoutOverlaps", () => {
  it("gives a lone event the full width", () => {
    const [only] = layoutOverlaps([event("a", 9, 10)]);
    expect(only).toMatchObject({ column: 0, columns: 1 });
  });

  it("splits two overlapping events into two columns", () => {
    const result = layoutOverlaps([event("a", 9, 11), event("b", 10, 12)]);
    expect(result.map((r) => [r.event.id, r.column, r.columns])).toEqual([
      ["a", 0, 2],
      ["b", 1, 2],
    ]);
  });

  it("reuses a column once its event has ended", () => {
    // b ends at 10, so c (10–11) takes b's column rather than a third one.
    const result = layoutOverlaps([
      event("a", 9, 12),
      event("b", 9, 10),
      event("c", 10, 11),
    ]);
    const byId = Object.fromEntries(result.map((r) => [r.event.id, r]));
    // Ties on start are broken by the earlier end, so b sorts ahead of a and
    // takes column 0; c inherits it. Which index they land on is an artefact —
    // what matters is that c reuses b's and does not open a third.
    expect(byId.c!.column).toBe(byId.b!.column);
    expect(byId.a!.column).not.toBe(byId.b!.column);
    expect(result.every((r) => r.columns === 2)).toBe(true);
  });

  it("stamps the whole cluster with its final width, not the width at insert time", () => {
    // The regression this guards: `a` is placed while the cluster is 1 wide.
    // A one-pass implementation leaves it at columns=1 and renders it full
    // width, straight over b and c.
    const result = layoutOverlaps([
      event("a", 9, 12),
      event("b", 10, 12),
      event("c", 11, 12),
    ]);
    expect(result.map((r) => r.columns)).toEqual([3, 3, 3]);
  });

  it("starts a fresh cluster once every column is free", () => {
    const result = layoutOverlaps([
      event("a", 9, 10),
      event("b", 9, 10),
      event("c", 14, 15),
    ]);
    const byId = Object.fromEntries(result.map((r) => [r.event.id, r]));
    expect(byId.a!.columns).toBe(2);
    expect(byId.c!.columns).toBe(1);
    expect(byId.c!.column).toBe(0);
  });

  it("treats a touching end/start as non-overlapping", () => {
    const result = layoutOverlaps([event("a", 9, 10), event("b", 10, 11)]);
    expect(result.every((r) => r.columns === 1 && r.column === 0)).toBe(true);
  });

  it("does not mutate the input array order", () => {
    const input = [event("late", 14, 15), event("early", 9, 10)];
    layoutOverlaps(input);
    expect(input.map((e) => e.id)).toEqual(["late", "early"]);
  });
});

describe("dayFraction", () => {
  it("maps the window start and end to 0 and 1", () => {
    expect(dayFraction(at(7), 7, 22)).toBe(0);
    expect(dayFraction(at(22), 7, 22)).toBe(1);
  });

  it("clamps times outside the visible window", () => {
    expect(dayFraction(at(3), 7, 22)).toBe(0);
    expect(dayFraction(at(23), 7, 22)).toBe(1);
  });

  it("places the midpoint at 0.5", () => {
    expect(dayFraction(at(14, 30), 7, 22)).toBeCloseTo(0.5);
  });
});

describe("occursOn / clipToDay", () => {
  const multiDay: AgendaEvent = {
    id: "m",
    title: "m",
    start: new Date(2026, 0, 5, 22),
    end: new Date(2026, 0, 7, 3),
  };

  it("matches every day the event touches", () => {
    expect(occursOn(multiDay, new Date(2026, 0, 5))).toBe(true);
    expect(occursOn(multiDay, new Date(2026, 0, 6))).toBe(true);
    expect(occursOn(multiDay, new Date(2026, 0, 7))).toBe(true);
    expect(occursOn(multiDay, new Date(2026, 0, 8))).toBe(false);
  });

  it("clips to the day's bounds", () => {
    const clipped = clipToDay(multiDay, new Date(2026, 0, 6));
    expect(clipped.start).toEqual(new Date(2026, 0, 6, 0, 0, 0, 0));
    expect(clipped.end).toEqual(new Date(2026, 0, 7, 0, 0, 0, 0));
  });

  it("returns the same object when no clipping is needed", () => {
    const single = event("s", 9, 10);
    expect(clipToDay(single, at(9))).toBe(single);
  });
});
