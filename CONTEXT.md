# Context — vyductan-react

Domain glossary for this repo. Terms here are the canonical vocabulary;
issues, refactor proposals, and test names should use them exactly.

## Terms

### Field binding

The value-wiring contract between a form presenter and its child input:
inject the committed value (as `value` or `valuePropName`), spread
`getValueProps(value)`, chain the child's own onChange/onBlur before the
form commit, commit `undefined` as `null`, and let `normalize` transform
the value (its `undefined` also committing as `null`).

One implementation: `@acme/ui/src/components/form/field-binding.ts`.
Contract pinned by `form/field-wiring.test.tsx` through both presenters.

### Presenter

A form entry point that owns layout but not wiring. Two live presenters
render through the field binding:

- **`Form.Item`** — AntD-style layout (labelCol/wrapperCol/colon) via
  `FormItemRow`.
- **`Field`** — shadcn-style layout (`ShadField` + `FieldLabel` +
  `FieldError`), exported from `@acme/ui/components/field`.

`Form.List` is a presenter shell only: it renders a `Field` with no
name/control (label wrapper) and hands `(fields, ctx)` to children; the
rows inside wire themselves via `Form.Item`/`Field`.
