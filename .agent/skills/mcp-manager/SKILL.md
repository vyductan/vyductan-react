---
name: mcp-manager
description: Manage MCP server and tool availability programmatically
---

# MCP Manager

This skill helps you verify and enable MCP servers and specific tools programmatically.
Use this when you need access to a disabled server (e.g., `gitlab`, `github`) or specific tools within them (e.g., `create_merge_request`).

## Usage

Run the `manage_mcp.py` script from the skill directory.

### 1. Enable a Server

If an entire server is disabled in `mcp_config.json`.

```bash
python .agent/skills/mcp-manager/scripts/manage_mcp.py --enable-server <server_name>
```

**Example:**

```bash
python .agent/skills/mcp-manager/scripts/manage_mcp.py --enable-server github
```

### 2. Enable Specific Tools

If a server is enabled but specific tools are disabled (blacklist). This will cleanly remove them from the `disabledTools` list.

```bash
python .agent/skills/mcp-manager/scripts/manage_mcp.py --enable-tools <server_name>:<tool1>,<tool2>
```

**Example:**

```bash
python .agent/skills/mcp-manager/scripts/manage_mcp.py --enable-tools gitlab:create_merge_request,create_issue
```

### 3. Important Note

After running any of these commands, you must **RESTART** the agent/workspace for the configuration changes to be loaded.
