---
name: create-mr
description: Create a GitLab Merge Request using Git push options or MCP
---

# Create GitLab Merge Request

This skill helps you create a GitLab Merge Request using the **GitLab MCP Server**.

## Prerequisites

- **Enabled MCP Server**: You must have `gitlab` enabled in `mcp_config.json`.
- **Enabled Tool**: You need access to `mcp_gitlab_create_merge_request`. This tool is often disabled by default, so you must explicitly enable it.

## Instructions

### 1. Enable GitLab MCP & Tools (If not already enabled)

Run the `mcp-manager` skill to enable the GitLab server AND the specific creation tool:

```bash
python .agent/skills/mcp-manager/scripts/manage_mcp.py --enable-server gitlab
python .agent/skills/mcp-manager/scripts/manage_mcp.py --enable-tools gitlab:create_merge_request
```

**IMPORTANT:** If you just enabled the server or tool, you must **RESTART THE AGENT** before the tools become available.

### 2. Create the Merge Request

Once the server and tool are active, use the `mcp_gitlab_create_merge_request` tool (note: actual tool name might vary slightly depending on server version, e.g. `create_mr` vs `create_merge_request`. Check available tools).

**Required Information:**

- `project_id`: Project ID or URL-encoded path
- `source_branch`: Name of branch with changes
- `target_branch`: Branch to merge into (e.g., `main` or `master`)
- `title`: MR Title
- `description`: MR Description (optional but recommended)

**Example Request:**
"Create an MR for project 'my-group/my-project' merging 'feature/auth' into 'main' with title 'Add Auth'"
