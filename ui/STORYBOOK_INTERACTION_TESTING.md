# Hướng dẫn viết Interaction Tests trong Storybook

Tài liệu này hướng dẫn cách viết **interaction tests phức tạp** cho Storybook chạy trong **browser mode** với Playwright.

---

## Tại sao viết Interaction Tests trong Storybook?

✅ **Chạy trong browser thật** (Chromium via Playwright) - giống production
✅ **Tự động test UI interactions** - click, type, keyboard, focus, etc.
✅ **Visual debugging** - xem tests chạy trong Storybook UI
✅ **Consistency** - tests chạy nhất quán giữa môi trường local và CI
✅ **Documentation** - stories vừa là demo vừa là tests

---

## Setup

### 1. Dependencies (Đã cài sẵn)

```json
{
  "@storybook/addon-vitest": "^...",
  "@vitest/browser-playwright": "^...",
  "storybook/test": "^..." // exports expect, fn, userEvent, within, waitFor
}
```

### 2. Vite Config

File `vite.config.ts` đã được cấu hình để chạy Storybook tests trong browser mode:

```typescript
export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "storybook",
          browser: {
            enabled: true, // Force browser mode
            headless: true, // Chạy headless (không hiện UI)
            provider: playwright({}),
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
```

---

## Cấu trúc một Interaction Test

### Template cơ bản

```typescript
import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";

export const InteractionExample: Story = {
  args: {
    // Props của component
    onClick: fn(), // Mock function để test callbacks
  },
  play: async ({ args, canvasElement, step }) => {
    // Setup
    const canvas = within(canvasElement);

    // Test steps
    await step("Description of what you're testing", async () => {
      // 1. Find elements
      const button = canvas.getByRole("button", { name: /click me/i });

      // 2. Assert initial state
      await expect(button).toBeInTheDocument();
      await expect(button).toBeVisible();

      // 3. Interact
      await userEvent.click(button);

      // 4. Assert result
      await expect(args.onClick).toHaveBeenCalled();
    });
  },
};
```

---

## API Reference

### 1. `within(canvasElement)`

Tạo scoped queries chỉ tìm trong story hiện tại.

```typescript
const canvas = within(canvasElement);

// Queries (ưu tiên theo thứ tự accessibility)
canvas.getByRole("button", { name: /submit/i }); // 🏆 Best
canvas.getByLabelText("Email"); // 🥈 Forms
canvas.getByPlaceholderText("Enter email..."); // 🥉 Fallback
canvas.getByText("Welcome"); // Nội dung text
canvas.getByTestId("submit-btn"); // ❌ Last resort

// Variants
canvas.queryByRole(); // Returns null nếu không tìm thấy
canvas.findByRole(); // Async - chờ element xuất hiện
```

**Best Practices:**

- Ưu tiên `getByRole` vì test accessibility
- Dùng `getByLabelText` cho form fields
- Tránh `getByTestId` trừ khi thật sự cần

### 2. `userEvent` - Simulate user interactions

```typescript
// Typing
await userEvent.type(input, "Hello World");
await userEvent.clear(input);
await userEvent.paste("Pasted text");

// Clicking
await userEvent.click(button);
await userEvent.dblClick(element);

// Keyboard
await userEvent.keyboard("{Enter}");
await userEvent.keyboard("{Escape}");
await userEvent.keyboard("{Tab}");
await userEvent.keyboard("Hello{Enter}"); // Type + Enter

// Selection
await userEvent.selectOptions(select, "option1");

// Focus
await userEvent.tab(); // Tab to next focusable element
```

### 3. `expect` - Assertions

```typescript
// DOM assertions
await expect(element).toBeInTheDocument();
await expect(element).toBeVisible();
await expect(element).toBeDisabled();
await expect(element).toBeEnabled();
await expect(element).toHaveFocus();
await expect(element).not.toHaveFocus();

// Value assertions
await expect(input).toHaveValue("Hello");
await expect(checkbox).toBeChecked();

// Text content
await expect(element).toHaveTextContent("Welcome");

// Attributes
await expect(button).toHaveAttribute("aria-label", "Close");
await expect(input).toHaveAttribute("aria-invalid", "true");

// Mock function assertions
await expect(mockFn).toHaveBeenCalled();
await expect(mockFn).toHaveBeenCalledTimes(3);
await expect(mockFn).toHaveBeenCalledWith({ email: "test@example.com" });
await expect(mockFn).not.toHaveBeenCalled();
```

### 4. `fn()` - Mock functions

```typescript
export const MyStory: Story = {
  args: {
    onClick: fn(),
    onSubmit: fn(),
    onSearch: fn(async (query: string) => {
      // Mock implementation với return value
      return ["result1", "result2"];
    }),
  },
  play: async ({ args }) => {
    // Test nếu functions được gọi
    await expect(args.onClick).toHaveBeenCalled();
  },
};
```

### 5. `waitFor` - Wait for async changes

```typescript
// Chờ element xuất hiện
await waitFor(
  async () => {
    const errorMsg = canvas.getByText(/error occurred/i);
    await expect(errorMsg).toBeInTheDocument();
  },
  { timeout: 2000 },
);

// Chờ loading biến mất
await waitFor(async () => {
  const spinner = canvas.queryByRole("status");
  await expect(spinner).not.toBeInTheDocument();
});
```

### 6. `step()` - Organize test steps

```typescript
await step("User fills login form", async () => {
  // Step 1 code
});

await step("User submits form", async () => {
  // Step 2 code
});

await step("Verify success message", async () => {
  // Step 3 code
});
```

---

## Patterns và Examples

### Pattern 1: Test Form Validation

```typescript
export const FormValidation: Story = {
  args: {
    onSubmit: fn(),
  },
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Submit empty form and verify errors", async () => {
      const submitBtn = canvas.getByRole("button", { name: /submit/i });
      await userEvent.click(submitBtn);

      // Chờ error messages xuất hiện
      await waitFor(async () => {
        const emailError = canvas.getByText(/email is required/i);
        await expect(emailError).toBeInTheDocument();
      });

      // Form không submit
      await expect(args.onSubmit).not.toHaveBeenCalled();
    });

    await step("Fill valid data and submit", async () => {
      const emailInput = canvas.getByLabelText(/email/i);
      await userEvent.type(emailInput, "user@example.com");

      const submitBtn = canvas.getByRole("button", { name: /submit/i });
      await userEvent.click(submitBtn);

      await expect(args.onSubmit).toHaveBeenCalledWith({
        email: "user@example.com",
      });
    });
  },
};
```

### Pattern 2: Test Async Search/Autocomplete

```typescript
export const SearchAutocomplete: Story = {
  args: {
    onSearch: fn(async (query: string) => {
      // Mock API call
      return ["Apple", "Apricot", "Avocado"];
    }),
    onSelect: fn(),
  },
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Type search query", async () => {
      const searchInput = canvas.getByPlaceholderText("Search...");
      await userEvent.type(searchInput, "app");

      // Chờ loading state
      await waitFor(
        async () => {
          const loading = canvas.queryByText("Loading...");
          await expect(loading).toBeInTheDocument();
        },
        { timeout: 500 },
      );

      // Chờ results xuất hiện
      await waitFor(
        async () => {
          const result = canvas.getByRole("option", { name: /apple/i });
          await expect(result).toBeInTheDocument();
        },
        { timeout: 2000 },
      );
    });

    await step("Click on result", async () => {
      const appleOption = canvas.getByRole("option", { name: /apple/i });
      await userEvent.click(appleOption);

      await expect(args.onSelect).toHaveBeenCalledWith("Apple");
    });
  },
};
```

### Pattern 3: Test Keyboard Navigation

```typescript
export const KeyboardNavigation: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Navigate with Tab key", async () => {
      const firstButton = canvas.getAllByRole("button")[0];

      // Focus first element
      await userEvent.click(firstButton);
      await expect(firstButton).toHaveFocus();

      // Tab to next element
      await userEvent.tab();
      const secondButton = canvas.getAllByRole("button")[1];
      await expect(secondButton).toHaveFocus();
    });

    await step("Press Enter to submit", async () => {
      await userEvent.keyboard("{Enter}");
      // Assert something happened
    });
  },
};
```

### Pattern 4: Test Toggle/Show-Hide

```typescript
export const TogglePassword: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Initially password is hidden", async () => {
      const passwordInput = canvas.getByLabelText(
        /password/i,
      ) as HTMLInputElement;
      await expect(passwordInput.type).toBe("password");
    });

    await step("Click show password button", async () => {
      const showBtn = canvas.getByLabelText(/show password/i);
      await userEvent.click(showBtn);

      const passwordInput = canvas.getByLabelText(
        /password/i,
      ) as HTMLInputElement;
      await expect(passwordInput.type).toBe("text");
    });
  },
};
```

### Pattern 5: Test Multi-step Flow

```typescript
export const MultiStepWizard: Story = {
  args: {
    onComplete: fn(),
  },
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Complete Step 1", async () => {
      const nameInput = canvas.getByLabelText(/name/i);
      await userEvent.type(nameInput, "John Doe");

      const nextBtn = canvas.getByRole("button", { name: /next/i });
      await userEvent.click(nextBtn);

      // Verify moved to step 2
      await waitFor(async () => {
        const step2Heading = canvas.getByText(/step 2/i);
        await expect(step2Heading).toBeInTheDocument();
      });
    });

    await step("Complete Step 2", async () => {
      const emailInput = canvas.getByLabelText(/email/i);
      await userEvent.type(emailInput, "john@example.com");

      const nextBtn = canvas.getByRole("button", { name: /next/i });
      await userEvent.click(nextBtn);
    });

    await step("Navigate back to verify persistence", async () => {
      const backBtn = canvas.getByRole("button", { name: /back/i });
      await userEvent.click(backBtn);

      // Data should still be there
      const emailInput = canvas.getByLabelText(/email/i) as HTMLInputElement;
      await expect(emailInput.value).toBe("john@example.com");
    });
  },
};
```

### Pattern 6: Test Disabled State

```typescript
export const DisabledBehavior: Story = {
  args: {
    disabled: true,
    onClick: fn(),
  },
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Verify disabled button cannot be clicked", async () => {
      const button = canvas.getByRole("button");

      await expect(button).toBeDisabled();

      // Try to click
      await userEvent.click(button);

      // onClick should NOT be called
      await expect(args.onClick).not.toHaveBeenCalled();
    });
  },
};
```

---

## Best Practices

### 1. Accessibility-First Queries

```typescript
// ✅ Good - Uses semantic roles
const button = canvas.getByRole("button", { name: /submit/i });
const heading = canvas.getByRole("heading", { name: /welcome/i });
const textbox = canvas.getByRole("textbox", { name: /email/i });

// ❌ Bad - Uses implementation details
const button = canvas.getByClassName("submit-btn");
const heading = canvasElement.querySelector("h1");
```

### 2. Organize với Steps

```typescript
// ✅ Good - Clear steps
await step("Fill form", async () => {
  /* ... */
});
await step("Submit form", async () => {
  /* ... */
});
await step("Verify success", async () => {
  /* ... */
});

// ❌ Bad - Monolithic test
play: async ({ canvasElement }) => {
  // 100 lines of test code without structure
};
```

### 3. Await ALL async operations

```typescript
// ✅ Good
await userEvent.click(button);
await expect(element).toBeInTheDocument();

// ❌ Bad - Missing await
userEvent.click(button); // Will cause timing issues
```

### 4. Use waitFor cho async state changes

```typescript
// ✅ Good - Wait for async changes
await waitFor(
  async () => {
    await expect(errorMsg).toBeInTheDocument();
  },
  { timeout: 2000 },
);

// ❌ Bad - Immediate assertion on async change
await expect(errorMsg).toBeInTheDocument(); // Might fail
```

### 5. Test edge cases

```typescript
// Test validation errors
// Test disabled states
// Test loading states
// Test empty states
// Test max length
// Test keyboard navigation
// Test accessibility (aria attributes)
```

---

## Chạy Tests

### Local Development

```bash
# Chạy Storybook với test mode
pnpm storybook

# Chạy tests qua CLI
pnpm test-storybook

# Chạy tests trong watch mode
pnpm vitest --project=storybook --watch

# Chạy tests với UI
pnpm vitest --project=storybook --ui

# Chạy với browser visible (không headless)
pnpm vitest --project=storybook --browser.headless=false
```

### CI/CD

```bash
# Build Storybook
pnpm build-storybook

# Run tests against built Storybook
pnpm test-storybook --url http://localhost:6006
```

---

## Troubleshooting

### Test fails trong addon nhưng pass trong Interactions panel

**Nguyên nhân:** Môi trường khác nhau (jsdom vs browser)

**Giải pháp:** Đảm bảo test chạy trong browser mode (đã config trong `vite.config.ts`)

### Element không tìm thấy

```typescript
// ❌ Element chưa render
const button = canvas.getByRole("button");

// ✅ Chờ element xuất hiện
await waitFor(async () => {
  const button = canvas.getByRole("button");
  await expect(button).toBeInTheDocument();
});
```

### Timing issues

```typescript
// ❌ Quá nhanh
await userEvent.click(button);
await expect(modal).toBeInTheDocument(); // Fail

// ✅ Chờ async state update
await userEvent.click(button);
await waitFor(async () => {
  await expect(modal).toBeInTheDocument();
});
```

### Mock function không được gọi

```typescript
// ✅ Ensure you're passing fn() in args
args: {
  onClick: fn(), // Mock function
}

// ❌ Don't create new mock in play
play: async ({ args }) => {
  const mockFn = fn(); // Wrong! Use args.onClick instead
}
```

---

## Ví dụ hoàn chỉnh

Xem các file sau để tham khảo:

1. **Input component tests**: [input.stories.tsx](./src/components/input/input.stories.tsx)
   - Basic typing
   - Character limit
   - Keyboard events
   - Clear button
   - Focus/Blur
   - Paste
   - Disabled state

2. **Button component tests**: [button.stories.tsx](./src/components/button/button.stories.tsx)
   - Click events
   - Disabled state
   - Loading state
   - Icon buttons

3. **Complex form examples**: [form-example.stories.tsx](./src/components/form-example.stories.tsx)
   - Login form với validation
   - Search với debounce và async
   - Multi-step form với navigation

---

## Resources

- [Storybook Interaction Testing Docs](https://storybook.js.org/docs/writing-tests/interaction-testing)
- [Storybook Vitest Plugin](https://storybook.js.org/docs/writing-tests/vitest-plugin)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
- [User Event API](https://testing-library.com/docs/user-event/intro)
- [Vitest Browser Mode](https://vitest.dev/guide/browser)

---

## Tóm tắt

✅ **Viết interaction tests trong Storybook stories**
✅ **Sử dụng `play` function với `step()` để organize tests**
✅ **Tests tự động chạy trong browser mode (Chromium)**
✅ **Use `fn()` để mock callbacks**
✅ **Use `within()` để scope queries**
✅ **Use `userEvent` để simulate interactions**
✅ **Use `expect()` để assert**
✅ **Use `waitFor()` cho async operations**
✅ **Prioritize accessibility queries (getByRole)**

Happy testing! 🎉
