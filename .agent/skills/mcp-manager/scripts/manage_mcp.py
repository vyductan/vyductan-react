import argparse
import json
import os
import sys

CONFIG_PATH = os.path.expanduser("~/.gemini/antigravity/mcp_config.json")

def load_config():
    if not os.path.exists(CONFIG_PATH):
        print(f"Error: Config file not found at {CONFIG_PATH}")
        sys.exit(1)
    try:
        with open(CONFIG_PATH, 'r') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error reading config: {e}")
        sys.exit(1)

def save_config(config):
    try:
        with open(CONFIG_PATH, 'w') as f:
            json.dump(config, f, indent=2)
        print("Configuration saved successfully.")
        print("IMPORTANT: You must restart the agent for changes to take effect.")
    except Exception as e:
        print(f"Error saving config: {e}")
        sys.exit(1)

def enable_server(config, server_name):
    changed = False
    servers = config.get('mcpServers', {})
    if server_name not in servers:
        print(f"Warning: Server '{server_name}' not found in configuration.")
        return False
    
    if servers[server_name].get('disabled', False):
        servers[server_name]['disabled'] = False
        print(f"Enabled server: {server_name}")
        changed = True
    else:
        print(f"Server '{server_name}' is already enabled.")
    
    return changed

def enable_tools(config, server_name, tools_to_enable):
    changed = False
    servers = config.get('mcpServers', {})
    if server_name not in servers:
        print(f"Warning: Server '{server_name}' not found in configuration.")
        return False
        
    server_config = servers[server_name]
    
    # Ensure server is enabled if we are enabling tools for it
    if server_config.get('disabled', False):
         print(f"Auto-enabling server '{server_name}' because tools were requested.")
         server_config['disabled'] = False
         changed = True

    disabled_tools = server_config.get('disabledTools', [])
    
    for tool in tools_to_enable:
        if tool in disabled_tools:
            disabled_tools.remove(tool)
            print(f"Enabled tool '{tool}' for server '{server_name}'")
            changed = True
        else:
             print(f"Tool '{tool}' is already enabled (or not in disabled list) for '{server_name}'")
             
    server_config['disabledTools'] = disabled_tools
    return changed

def main():
    parser = argparse.ArgumentParser(description="Manage MCP Configuration")
    parser.add_argument('--enable-server', help="Enable a specific MCP server")
    parser.add_argument('--enable-tools', help="Enable specific tools for a server. Format: server:tool1,tool2")
    
    args = parser.parse_args()
    
    if not args.enable_server and not args.enable_tools:
        parser.print_help()
        return

    config = load_config()
    changed = False

    if args.enable_server:
        if enable_server(config, args.enable_server):
            changed = True

    if args.enable_tools:
        try:
            server, tools_str = args.enable_tools.split(':')
            tools = [t.strip() for t in tools_str.split(',')]
            if enable_tools(config, server, tools):
                changed = True
        except ValueError:
            print("Error: Invalid format for --enable-tools. Expected 'server:tool1,tool2'")
            sys.exit(1)

    if changed:
        save_config(config)
    else:
        print("No changes made.")

if __name__ == "__main__":
    main()
