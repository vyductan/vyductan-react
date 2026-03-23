# Date Picker / Calendar Support Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add real `week` and `quarter` picker support to `@acme/ui` date picker and enforce whole-period validity for `month`, `year`, `week`, and `quarter` selections.

**Architecture:** Keep the public `DatePicker` API unchanged and implement the behavior inside `@acme/ui/src/components/date-picker/date-picker.tsx`. Reuse the existing calendar and month/year overlay flows, but normalize committed values by picker type and validate the full period before hover preview or commit. Add focused regression tests instead of broad refactors.

**Tech Stack:** React, Dayjs, Vitest, Testing Library, Storybook interaction tests, react-day-picker

---

### Task 1: Add failing tests for pure month/year whole-period validation

**Files:**
- Modify: `@acme/ui/src/components/modal/modal.test.tsx`
- Create: `@acme/ui/src/components/date-picker/date-picker.test.tsx`
- Modify: `@acme/ui/src/components/date-picker/date-picker.stories.tsx`

**Step 1: Write the failing test**

Create `@acme/ui/src/components/date-picker/date-picker.test.tsx` with a focused unit test that renders `DatePicker` in `picker="month"` and `picker="year"` modes and asserts an invalid whole month/year is rejected when any day in the period violates `minDate`, `maxDate`, or `disabledDate`.

Example shape:

```tsx
test("rejects month and year selections when any day in the period is invalid", async () => {
  render(
    <DatePicker open picker="month" minDate={dayjs("2024-05-10")} defaultValue={dayjs("2024-05-15")} />,
  )

  // switch into month grid, try to pick May, assert value does not commit
})
```

**Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run src/components/date-picker/date-picker.test.tsx`
Expected: FAIL because current month/year commit paths in `@acme/ui/src/components/date-picker/date-picker.tsx:291-299` and `:347-355` commit without validating the whole period.

**Step 3: Write minimal implementation**

Do not implement yet. Stop after confirming RED.

**Step 4: Re-run test to ensure failure is stable**

Run: `pnpm exec vitest run src/components/date-picker/date-picker.test.tsx`
Expected: same failure.

**Step 5: Commit**

```bash
git add @acme/ui/src/components/date-picker/date-picker.test.tsx
git commit -m "test: cover month and year period validation"
```

---

### Task 2: Implement whole-period validation helpers

**Files:**
- Modify: `@acme/ui/src/components/date-picker/date-picker.tsx:40-370`
- Test: `@acme/ui/src/components/date-picker/date-picker.test.tsx`

**Step 1: Write the failing test**

Use the existing failing test from Task 1. Do not add new behavior yet.

**Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run src/components/date-picker/date-picker.test.tsx`
Expected: FAIL.

**Step 3: Write minimal implementation**

Inside `@acme/ui/src/components/date-picker/date-picker.tsx`, add small local helpers to:
- compute the normalized start of a picker period
- enumerate the dates in a month, year, week, or quarter period
- validate that **all** dates in the period satisfy `minDate`, `maxDate`, and `disabledDate`

Keep this local to the file unless duplication forces extraction.

Example shape:

```tsx
const isDateAllowed = (date: Dayjs) => {
  if (minDate && date.isBefore(minDate, "day")) return false;
  if (maxDate && date.isAfter(maxDate, "day")) return false;
  if (disabledDate?.(date, { type: picker ?? "date" })) return false;
  return true;
};

const isWholePeriodAllowed = (start: Dayjs, mode: "month" | "year" | "week" | "quarter") => {
  // iterate every day in the period
};
```

Apply the helper before committing `month` and `year` selections.

**Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run src/components/date-picker/date-picker.test.tsx`
Expected: PASS for the month/year validation case.

**Step 5: Commit**

```bash
git add @acme/ui/src/components/date-picker/date-picker.tsx @acme/ui/src/components/date-picker/date-picker.test.tsx
git commit -m "fix: validate full month and year selections"
```

---

### Task 3: Add failing tests for week and quarter support

**Files:**
- Modify: `@acme/ui/src/components/date-picker/date-picker.test.tsx`
- Modify: `@acme/ui/src/components/date-picker/date-picker.stories.tsx`

**Step 1: Write the failing test**

Add focused tests for:
- `picker="week"` commits `startOf("week")`
- `picker="quarter"` commits `startOf("quarter")`
- both modes reject selection if any day in the whole week/quarter is invalid

Example shape:

```tsx
test("commits the start of the selected week", async () => {
  render(<DatePicker open picker="week" onChange={onChange} />)
  // click a day
  expect(onChange).toHaveBeenCalledWith(dayjs("2024-05-12").startOf("week"), expect.any(String))
})

test("rejects quarter selection when any day in the quarter is invalid", async () => {
  // open quarter flow, select month in quarter, assert commit is blocked
})
```

Prefer real DOM interactions over calling internal helpers.

**Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run src/components/date-picker/date-picker.test.tsx`
Expected: FAIL because `week` and `quarter` currently fall through to date/month-like behavior rather than true period semantics.

**Step 3: Write minimal implementation**

Do not implement yet. Stop once RED is confirmed.

**Step 4: Re-run to verify failure reason**

Run: `pnpm exec vitest run src/components/date-picker/date-picker.test.tsx`
Expected: same failure.

**Step 5: Commit**

```bash
git add @acme/ui/src/components/date-picker/date-picker.test.tsx
git commit -m "test: cover week and quarter picker behavior"
```

---

### Task 4: Implement week support in date calendar flow

**Files:**
- Modify: `@acme/ui/src/components/date-picker/date-picker.tsx:120-690`
- Test: `@acme/ui/src/components/date-picker/date-picker.test.tsx`

**Step 1: Write the failing test**

Use the failing `picker="week"` test from Task 3.

**Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run src/components/date-picker/date-picker.test.tsx`
Expected: FAIL.

**Step 3: Write minimal implementation**

Update the date-calendar selection flow so that when `picker === "week"`:
- hover preview uses the selected week semantics if needed
- committing from day selection normalizes to `dayjs(date).startOf("week")`
- commit is blocked unless the entire week is valid
- input format is appropriate for week mode

Keep the existing date path unchanged for normal `picker="date"`.

**Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run src/components/date-picker/date-picker.test.tsx`
Expected: PASS for week semantics and week validation.

**Step 5: Commit**

```bash
git add @acme/ui/src/components/date-picker/date-picker.tsx @acme/ui/src/components/date-picker/date-picker.test.tsx
git commit -m "feat: support week picker semantics"
```

---

### Task 5: Implement quarter support in month grid flow

**Files:**
- Modify: `@acme/ui/src/components/date-picker/date-picker.tsx:319-370`
- Test: `@acme/ui/src/components/date-picker/date-picker.test.tsx`

**Step 1: Write the failing test**

Use the failing `picker="quarter"` test from Task 3.

**Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run src/components/date-picker/date-picker.test.tsx`
Expected: FAIL.

**Step 3: Write minimal implementation**

Update the month-grid selection flow so that when `picker === "quarter"`:
- selecting any month commits `selectedMonth.startOf("quarter")`
- commit is blocked unless the entire quarter is valid
- input display string/format matches quarter semantics
- existing `picker="month"` behavior remains unchanged except for full-period validation

**Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run src/components/date-picker/date-picker.test.tsx`
Expected: PASS for quarter semantics and quarter validation.

**Step 5: Commit**

```bash
git add @acme/ui/src/components/date-picker/date-picker.tsx @acme/ui/src/components/date-picker/date-picker.test.tsx
git commit -m "feat: support quarter picker semantics"
```

---

### Task 6: Add or update Storybook verification coverage

**Files:**
- Modify: `@acme/ui/src/components/date-picker/date-picker.stories.tsx`
- Test: `@acme/ui/src/components/date-picker/date-picker.stories.tsx`

**Step 1: Write the failing story interaction/assertion**

Add small verification coverage for at least one `week` and one `quarter` case, or update story assertions so these modes are exercised intentionally instead of just rendered.

**Step 2: Run story test to verify current behavior fails or is unverified**

Run: `pnpm exec vitest run src/components/date-picker/date-picker.stories.tsx`
Expected: either FAIL or lack meaningful coverage for the new semantics.

**Step 3: Write minimal implementation**

Only add the smallest story assertions needed to guard the newly supported behavior.

**Step 4: Run story test to verify it passes**

Run: `pnpm exec vitest run src/components/date-picker/date-picker.stories.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add @acme/ui/src/components/date-picker/date-picker.stories.tsx
git commit -m "test: verify week and quarter picker stories"
```

---

### Task 7: Final verification

**Files:**
- Test: `@acme/ui/src/components/date-picker/date-picker.test.tsx`
- Test: `@acme/ui/src/components/date-picker/date-picker.stories.tsx`
- Test: `@acme/ui/src/components/calendar/calendar.tsx` (indirectly through date-picker tests)

**Step 1: Run targeted unit tests**

Run: `pnpm exec vitest run src/components/date-picker/date-picker.test.tsx`
Expected: PASS.

**Step 2: Run targeted story tests**

Run: `pnpm exec vitest run src/components/date-picker/date-picker.stories.tsx`
Expected: PASS.

**Step 3: Review for regression scope**

Check that normal `date`, `month`, and `year` flows still behave as before except for the new whole-period validation.

**Step 4: Optional broader verification**

Run: `pnpm -F @acme/ui test -- --runInBand src/components/date-picker/date-picker.stories.tsx`
Expected: PASS if the workspace test config resolves the same target cleanly.

**Step 5: Commit**

```bash
git add @acme/ui/src/components/date-picker/date-picker.tsx @acme/ui/src/components/date-picker/date-picker.test.tsx @acme/ui/src/components/date-picker/date-picker.stories.tsx
git commit -m "feat: add week and quarter picker support"
```
