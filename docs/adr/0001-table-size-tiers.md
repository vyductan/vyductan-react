# Table size tiers diverge from Ant Design's padding defaults

`Table` now maps its three size tiers to distinct cell paddings — `small` 8px,
`middle` 12px, `large` 16px — with `middle` as the tier an unset `size`
resolves to. Ant Design's Table tokens are 16px (`cellPaddingBlock`),
12/8 (`...MD`) and 8/8 (`...SM`), and AntD's default size is `large`. We
deliberately match neither of those two defaults: `middle` stays a symmetric
12px rather than AntD's 12/8, and it — not `large` — is what an unset `size`
means.

## Why

Before this, every size-sensitive site branched on `size === "small"` alone, so
`middle` and `large` rendered identically: the prop advertised three tiers and
delivered two. Fixing that meant choosing what the existing, unset-`size`
rendering (a symmetric 12px) becomes. 72 of the 74 `<Table>` call sites in the
workspace pass no `size` at all, so any answer that moved the unset rendering
would silently relayout almost every table in the product.

Naming that rendering `middle` and leaving its numbers alone keeps all 72 sites
pixel-identical while still yielding three genuinely distinct tiers. AntD
parity here is about the _API_ — three tiers, sensibly ordered — not about
matching its pixels.

## Considered and rejected

- **Default to `large`, matching AntD exactly.** Correct on paper; every
  existing table's rows grow 4px per cell edge, changing dashboard layouts
  across the product for no requested benefit.
- **Default to `middle` but take AntD's 12/8.** Three tiers _and_ pixel
  parity, at the cost of narrowing 72 tables' horizontal padding by 4px per
  edge. Rejected as churn we cannot justify to anyone looking at the result.
- **Leave the unset rendering as a fourth, unnamed state.** Zero regression,
  but a prop with three documented values and four effective ones.

## Consequences

- A reader comparing `CELL_PADDING_CLASS` in
  `@acme/ui/src/components/table/_components/base.tsx` against AntD's tokens
  will find `middle` off by 4px horizontally. That is this decision, not a bug.
- Two quantities are derived from the padding tier and must move with it: the
  right-hand gutter on body cells of a right-aligned sortable column
  (padding + 20px), and the sortable header's hover box (padding, with a
  matching negative margin). All three maps live side by side in `base.tsx` for
  that reason, and `table.test.tsx` pins each tier.
- `Table` still ignores any ambient size. `componentSize` is commented out in
  `ConfigProvider`, and only `<Form size>` publishes a `SizeContext` — so a
  table inside a small form does not shrink. Out of scope here.
