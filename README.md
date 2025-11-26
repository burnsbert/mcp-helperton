# MCP Helpy Helperton

A text-based UI tool for managing MCP (Model Context Protocol) servers in Claude Code's global configuration.

## Why Use This?

Each enabled MCP server consumes context space in Claude Code. If you have many MCPs configured but only use a few regularly, the unused ones are still taking up valuable context tokens.

**MCP Helpy Helperton lets you:**

- **Maximize context space** by disabling MCPs you're not currently using
- **Preserve configurations** so you don't lose complex MCP setups (API keys, paths, environment variables)
- **Quickly re-enable** any MCP when you need it, without manual reconfiguration
- **Switch between workflows** by enabling different MCP combinations for different tasks

## Features

- **Visual MCP Management**: See all your enabled and disabled MCP servers in one place
- **Easy Toggle**: Use arrow keys to navigate and Enter to enable/disable servers
- **Persistent Storage**: Disabled MCPs are stored locally and survive across sessions
- **Non-Destructive**: Original MCP configurations (including env vars, args, etc.) are fully preserved
- **Automatic Backup**: Creates a backup of your config on first use

## Installation

See [INSTALL.md](INSTALL.md) for detailed installation instructions.

Quick install:

```bash
npm install -g mcp-helperton
```

## Usage

```bash
mcp-helperton
```

### Controls

| Key | Action |
|-----|--------|
| `↑` / `↓` | Navigate up/down |
| `Enter` | Toggle selected MCP (enable/disable) |
| `s` | Save and quit |
| `q` | Quit without saving |

### Display

```
┌───────────────────────────────────────────────────────┐
│                 MCP Helpy Helperton                   │
├───────────────────────────────────────────────────────┤
│   [✓] slack                                           │
│   [✓] jira-read                                       │
│  >[✓] servicetrade-mcp                   ← selected   │
│   [ ] github-mcp                         ← disabled   │
│   [ ] filesystem                                      │
├───────────────────────────────────────────────────────┤
│   ↑↓ Navigate   Enter Toggle   s Save & Quit   q Quit │
└───────────────────────────────────────────────────────┘
```

- `[✓]` = Enabled (in Claude Code config)
- `[ ]` = Disabled (stored in helpy config)
- `>` = Currently selected

## How It Works

1. **Reads** Claude Code's global MCP configuration from `~/.claude.json`

2. **Stores** disabled MCPs in `~/.config/mcp-helperton/helpy.json`

3. **When disabling**: Removes the MCP from Claude Code config and saves the full config to helpy storage

4. **When enabling**: Restores the MCP from helpy storage back to Claude Code config

5. **Backup**: On first save, creates `~/.claude.json.helperton-backup` for safety

## Configuration

The tool stores its data in:

| Platform | Path |
|----------|------|
| macOS/Linux | `~/.config/mcp-helperton/helpy.json` |
| Windows | `%APPDATA%\mcp-helperton\helpy.json` |

### helpy.json Structure

```json
{
  "disabledServers": {
    "server-name": {
      "command": "/path/to/server",
      "args": ["arg1", "arg2"],
      "env": {
        "API_KEY": "..."
      }
    }
  }
}
```

## Requirements

- Node.js 18+
- Claude Code CLI installed

## License

MIT

## Contributing

Contributions welcome! Please open an issue or PR on GitHub.
