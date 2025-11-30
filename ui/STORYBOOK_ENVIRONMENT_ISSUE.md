# Xử lý vấn đề Test khác nhau giữa các môi trường

## Vấn đề

Khi chạy tests với Storybook addon, có thể gặp tình huống:
- Tests **FAIL** khi chạy trong addon/CLI với Vitest
- Tests **PASS** khi xem trong Interactions panel (hoặc ngược lại)

## Nguyên nhân

Tests chạy trong **2 môi trường khác nhau**:

1. **Storybook Interactions Panel**: Chạy trong **browser thật** (Chromium qua Playwright)
2. **Unit tests thông thường**: Chạy trong **jsdom** (Node.js giả lập DOM)

Sự khác biệt về môi trường dẫn đến:
- DOM APIs hoạt động khác nhau
- Timing và async behavior khác nhau
- Browser-specific features (IntersectionObserver, ResizeObserver, etc.) có/không có
- CSS rendering và layout khác nhau

## Giải pháp

### Cách 1: Đồng nhất môi trường - Dùng Browser Mode cho tất cả (Khuyến nghị)

Sửa `vite.config.ts` để force tất cả tests chạy trong browser:

```typescript
export default defineConfig({
  test: {
    globals: true,
    // Force browser mode để match với Storybook
    browser: {
      enabled: true,
      headless: true,
      provider: playwright({}),
      instances: [
        {
          browser: "chromium",
        },
      ],
    },
    setupFiles: ["./.storybook/vitest-setup.ts"],
    include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    // ... rest of config
  },
});
```

**Ưu điểm:**
- Tests chạy trong môi trường giống production
- Kết quả nhất quán giữa Storybook và unit tests
- Phát hiện được browser-specific bugs

**Nhược điểm:**
- Chậm hơn jsdom
- Cần cài Playwright browsers

### Cách 2: Tách riêng Unit tests và Integration tests

Giữ nguyên config hiện tại với 2 projects:
- **unit**: Tests nhanh với jsdom
- **storybook**: Integration tests với browser

```typescript
export default defineConfig({
  test: {
    globals: true,
    projects: [
      // Fast unit tests
      {
        test: {
          name: "unit",
          environment: "jsdom",
          include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
        },
      },
      // Storybook integration tests
      {
        test: {
          name: "storybook",
          browser: { enabled: true, ... },
          include: [], // Uses Storybook stories
        },
      },
    ],
  },
});
```

**Chạy tests:**
```bash
# Chỉ unit tests (nhanh)
pnpm vitest --project=unit

# Chỉ storybook tests
pnpm vitest --project=storybook

# Cả hai
pnpm vitest
```

### Cách 3: Mock browser APIs trong jsdom

Nếu muốn giữ jsdom, thêm polyfills trong setup file:

```typescript
// .storybook/vitest-setup.ts
import { beforeAll } from 'vitest';

beforeAll(() => {
  // Mock IntersectionObserver
  global.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    takeRecords() { return []; }
    unobserve() {}
  };

  // Mock ResizeObserver
  global.ResizeObserver = class ResizeObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    unobserve() {}
  };

  // Mock matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});
```

**Ưu điểm:**
- Tests vẫn chạy nhanh
- Ít phải thay đổi config

**Nhược điểm:**
- Phải maintain mocks
- Không test được real browser behavior
- Vẫn có thể có sự khác biệt

## Khuyến nghị

Dùng **Cách 1** (Browser mode cho tất cả) vì:
1. Storybook đã force browser mode rồi
2. Đảm bảo consistency
3. Test được real browser behavior
4. Ít phức tạp hơn trong setup

Nếu tests quá chậm, mới cân nhắc **Cách 2** (tách riêng unit/integration tests).

## Các lệnh hữu ích

```bash
# Chạy tests với UI (debug dễ hơn)
pnpm vitest --ui

# Chạy tests trong browser mode với headed (xem browser thật)
pnpm vitest --browser.headless=false

# Chỉ chạy storybook tests
pnpm vitest --project=storybook

# Watch mode
pnpm vitest --watch
```

## Tham khảo

- [Vitest Browser Mode](https://vitest.dev/guide/browser)
- [Storybook Vitest Plugin](https://storybook.js.org/docs/writing-tests/vitest-plugin)
- [Playwright Provider](https://vitest.dev/guide/browser/playwright)
