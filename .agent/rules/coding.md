---
trigger: always_on
---

# Component & Props

- When deleting a prop from a component, MUST check all components that are using that prop and update them accordingly.

# Best Practices

- Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator.
- Prefer `Number.parseFloat` over `parseFloat`.eslintunicorn/prefer-number-properties
- Unnecessary conditional, expected left-hand side of `??` operator to be possibly null or undefined.eslint@typescript-eslint/no-unnecessary-condition
- Unexpected any. Specify a different type.eslint@typescript-eslint/no-explicit-any
- Prefer `.querySelector()` over `.getElementById()`.
- Forbidden non-null assertion.eslint@typescript-eslint/no-non-null-assertion
- Always use `pnpm` instead of `npm` or `yarn` for package management.
