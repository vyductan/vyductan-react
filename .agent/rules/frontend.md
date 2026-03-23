---
trigger: always_on
---

# Frontend

## Components

- Prefer using the `Tag` component over the `Badge` component.
- When using `Switch` inside `<Field>`, add `layout="horizontal"` to `<Field>`.
- Do not use `space-y-*` classes for layout when using `<Field>` components, as they already have built-in `mb-*` styling.

### Component API & Styling Strategies

#### Hybrid (Shadcn UI + Ant Design API)

These components utilize Shadcn/Tailwind for styling but support Ant Design props and APIs (e.g., `size="large"`, `type="primary"`, `status`, `loading`).

- `avatar` (Supports `src`, `icon`, `alt` props)
- `button` (Supports `type`, `danger`, `loading`, `icon` props)
- `card` (Supports `title`, `extra`, `bordered`, `loading` props)
- `date-picker` (Antd-like API with Shadcn internals)
- `divider`
- `input` (Supports `status`, `showCount`, `allowClear`, `prefix/suffix`)
- `modal` (Supports `title`, `footer`, `onOk`, `onCancel`, `width`)
- `select` (Supports `options`, `mode="multiple"`, `showSearch`)
- `table` (TanStack Table with Antd-like `columns`, `pagination`, `rowSelection` API)
- `tag`
- `time-picker`

#### Ant Design Style

These components implement Ant Design specific features, APIs, or are custom implementations inspired by Ant Design.

- `descriptions`
- `empty`
- `layout` (PageHeader, PageContainer, etc.)
- `list`
- `mentions`
- `menu`
- `pagination`
- `result`
- `spin`
- `statistic`
- `steps`
- `timeline`
- `tree`
- `upload`

#### Shadcn Style (Standard)

These components follow the Radix UI / Shadcn patterns strictly. They are often direct re-exports or light wrappers around the `shadcn` directory components.

- `accordion`
- `alert`
- `aspect-ratio`
- `badge`
- `breadcrumb`
- `calendar`
- `carousel`
- `checkbox`
- `collapsible`
- `command`
- `context-menu`
- `dialog` (Primitive)
- `drawer`
- `dropdown-menu`
- `form`
- `hover-card`
- `label`
- `menubar`
- `navigation-menu`
- `popover`
- `progress`
- `radio-group`
- `resizable`
- `scroll-area`
- `separator`
- `sheet`
- `skeleton`
- `slider`
- `switch`
- `tabs`
- `textarea`
- `toast`
- `toggle`
- `toggle-group`
- `tooltip`

## Icon

- Use `Icon` from `@acme/ui/components/icons`
- Example: `<Icon icon="icon-[lucide--plus]" />`
