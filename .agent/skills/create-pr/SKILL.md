---
name: create-pr
description: Create a GitHub Pull Request using MCP (mcp_github_create_pull_request)
---

# Create GitHub Pull Request

This skill helps you create a GitHub Pull Request using the **GitHub MCP Server**.

## Prerequisites

- **Enabled MCP Server**: You must have `github` enabled in `mcp_config.json`.
- **Enabled Tool**: You need access to `mcp_github_create_pull_request`.

## Instructions

### 1. Enable GitHub MCP (If not already enabled)

Run the `mcp-manager` skill to enable the GitHub server:

```bash
python .agent/skills/mcp-manager/scripts/manage_mcp.py --enable-server github
```

**IMPORTANT:** If you just enabled the server, you must **RESTART THE AGENT** before the tools become available.

### 2. Create the Pull Request

Once the server is active, use the `mcp_github_create_pull_request` tool.

**Required Information:**

- `owner`: Repository owner (user or org)
- `repo`: Repository name
- `title`: PR Title
- `head`: The branch containing your changes (e.g., `feature/my-new-feature`)
- `base`: The branch you want to merge into (usually `main` or `master`)
- `body`: Description of your changes

**Example Request:**
"Create a PR to merge `feature/login` into `main` with title 'Add Login Feature' and description 'Implements user authentication'"
