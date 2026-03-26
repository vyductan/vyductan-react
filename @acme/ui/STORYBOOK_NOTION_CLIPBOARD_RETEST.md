# Storybook ↔ Notion clipboard retest

This package includes a reusable Playwright retest for the editor clipboard flow.

## Local Storybook payload retest

Start Storybook in `@acme/ui`:

```bash
pnpm storybook
```

Then run the clipboard retest command in another terminal:

```bash
pnpm test:editor:notion-clipboard
```

What this checks locally:

- single paragraph with soft line breaks keeps single newlines in `text/plain`
- multiple real paragraphs are copied with blank lines in `text/plain`
- the generated `text/html` stays in the expected shape for both cases

By default the command reads from:

- `http://127.0.0.1:6006/iframe.html?id=components-editor--playground`

If Storybook is running on a different origin, set `STORYBOOK_ORIGIN` before running the command.

Example:

```bash
STORYBOOK_ORIGIN="http://127.0.0.1:7007" pnpm test:editor:notion-clipboard
```

## Live Notion retest

The same command also contains an optional live Notion check.

Enable it by setting:

- `RUN_NOTION_E2E=1`
- `NOTION_PAGE_URL=<your notion page url>`

Example:

```bash
RUN_NOTION_E2E=1 \
NOTION_PAGE_URL="https://www.notion.so/your-workspace/your-page-id" \
pnpm test:editor:notion-clipboard
```

## How to pass `NOTION_PAGE_URL`

Use a full Notion page URL that should receive the paste.

Good example:

```bash
NOTION_PAGE_URL="https://www.notion.so/your-workspace/your-page-id"
```

Notes:

- use a page that is safe to edit during testing
- the live Notion step is skipped unless both `RUN_NOTION_E2E=1` and `NOTION_PAGE_URL` are set
- the Playwright test opens a fresh browser context, so if the target page requires authentication, make sure your local setup can access that page before relying on the live check
