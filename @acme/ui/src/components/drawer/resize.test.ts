import { describe, expect, test } from "vitest";

import {
  clampDrawerSize,
  isHorizontalPlacement,
  MIN_DRAWER_SIZE,
  resizeDelta,
  resolveDrawerSize,
} from "./resize";

describe("resolveDrawerSize", () => {
  test("presets", () => {
    expect(resolveDrawerSize("default")).toBe("448px");
    expect(resolveDrawerSize("large")).toBe("736px");
    expect(resolveDrawerSize(undefined)).toBe("448px");
  });

  test("number is px, string passes through as a CSS length", () => {
    expect(resolveDrawerSize(320)).toBe("320px");
    expect(resolveDrawerSize("50%")).toBe("50%");
    expect(resolveDrawerSize("20vw")).toBe("20vw");
  });
});

describe("resizeDelta", () => {
  // The grip is on the drawer's INNER edge, so "grow" points away from the
  // edge the drawer is anchored to.
  test("grows away from the anchored edge", () => {
    expect(resizeDelta("right", -10, 0)).toBe(10);
    expect(resizeDelta("left", 10, 0)).toBe(10);
    expect(resizeDelta("bottom", 0, -10)).toBe(10);
    expect(resizeDelta("top", 0, 10)).toBe(10);
  });

  test("shrinks in the opposite direction", () => {
    expect(resizeDelta("right", 10, 0)).toBe(-10);
    expect(resizeDelta("top", 0, -10)).toBe(-10);
  });
});

describe("clampDrawerSize", () => {
  test("floors at MIN_DRAWER_SIZE so the grip stays reachable", () => {
    expect(clampDrawerSize(-200)).toBe(MIN_DRAWER_SIZE);
    expect(clampDrawerSize(0)).toBe(MIN_DRAWER_SIZE);
  });

  test("caps at maxSize", () => {
    expect(clampDrawerSize(900, 800)).toBe(800);
    expect(clampDrawerSize(700, 800)).toBe(700);
  });

  test("uncapped without maxSize", () => {
    expect(clampDrawerSize(5000)).toBe(5000);
  });

  test("a maxSize below the floor cannot pin the drawer shut", () => {
    expect(clampDrawerSize(100, 10)).toBe(MIN_DRAWER_SIZE);
  });
});

describe("isHorizontalPlacement", () => {
  test("left/right size on x, top/bottom on y", () => {
    expect(isHorizontalPlacement("left")).toBe(true);
    expect(isHorizontalPlacement("right")).toBe(true);
    expect(isHorizontalPlacement("top")).toBe(false);
    expect(isHorizontalPlacement("bottom")).toBe(false);
  });
});
