# Editor Plugins

Plugin implementations that extend editor functionality.

## Files and Directories

| Path                                      | What                                        | When to read                             |
| ----------------------------------------- | ------------------------------------------- | ---------------------------------------- |
| `plugins.tsx`                             | Main plugin registry and initialization     | Setting up editor plugins                |
| `drag-drop-paste-plugin.tsx`              | Plugin for drag-and-drop and paste handling | Implementing file/content drag-drop      |
| `mentions-plugin.tsx`                     | Plugin for @mention functionality           | Adding mention autocomplete              |
| `list-max-indent-level-plugin.tsx`        | Plugin for limiting list nesting depth      | Controlling list indentation             |
| `markdown-plugins.tsx`                    | Plugins for Markdown support                | Enabling Markdown shortcuts              |
| `keyboard-shortcuts-help-plugin.tsx`      | Plugin for keyboard shortcut help dialog    | Displaying keyboard shortcuts            |
| `floating-link-editor-plugin.tsx`         | Plugin for floating link editor             | Editing links inline                     |
| `emoji-picker-plugin.tsx`                 | Plugin for emoji picker interface           | Adding emoji selection UI                |
| `video-plugin.tsx`                        | Plugin for video handling                   | Managing video embeds                    |
| `link-plugin.tsx`                         | Plugin for link handling and validation     | Processing and validating links          |
| `markdown-paste-plugin.tsx`               | Plugin for pasting Markdown content         | Converting pasted Markdown               |
| `emojis-plugin.tsx`                       | Plugin for emoji shortcode conversion       | Converting :emoji: codes                 |
| `floating-text-format-toolbar-plugin.tsx` | Plugin for floating text formatting toolbar | Showing format toolbar on selection      |
| `actions/`                                | Action plugins for editor commands          | Implementing editor actions and commands |
| `default/`                                | Default plugin configurations               | Using standard plugin setups             |
| `embeds/`                                 | Embed-related plugins                       | Managing embedded content                |
| `toolbar/`                                | Toolbar plugins and components              | Building custom toolbars                 |
