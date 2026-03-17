# Editor Nodes

Custom Lexical nodes for different content types in the editor.

## Files and Directories

| Path                            | What                                    | When to read                             |
| ------------------------------- | --------------------------------------- | ---------------------------------------- |
| `nodes.ts`                      | Node registry and configuration         | Registering custom nodes in editor       |
| `collapsible-title-node.ts`     | Title node for collapsible sections     | Creating collapsible content sections    |
| `collapsible-content-node.ts`   | Content node for collapsible sections   | Implementing collapsible content areas   |
| `collapsible-container-node.ts` | Container node for collapsible sections | Managing collapsible section structure   |
| `file-attachment-node.tsx`      | Node for file attachments               | Adding file upload support               |
| `equation-node.tsx`             | Node for mathematical equations         | Implementing LaTeX/math equation support |
| `emoji-node.tsx`                | Node for emoji content                  | Adding emoji support to editor           |
| `poll-node.tsx`                 | Node for poll/survey content            | Creating interactive polls               |
| `video-node.tsx`                | Node for video embeds                   | Embedding video content                  |
| `keyword-node.tsx`              | Node for keyword/tag content            | Implementing keyword tagging             |
| `excalidraw-node.tsx`           | Node for Excalidraw diagrams            | Embedding drawing/diagram tools          |
| `layout-item-node.tsx`          | Node for layout grid items              | Creating multi-column layouts            |
| `layout-container-node.tsx`     | Container node for layout grids         | Managing layout grid structure           |
| `check-block-node.tsx`          | Node for checkbox/task items            | Implementing task lists                  |
| `page-break-node.tsx`           | Node for page breaks                    | Adding print page break support          |
| `image-node.tsx`                | Node for image content                  | Handling image insertion and display     |
| `mention-node.ts`               | Node for @mentions                      | Implementing user/entity mentions        |
| `toc-node.tsx`                  | Node for table of contents              | Generating automatic TOC                 |
| `autocomplete-node.tsx`         | Node for autocomplete triggers          | Building autocomplete functionality      |
| `embeds/`                       | Social media and external embed nodes   | Embedding third-party content            |
