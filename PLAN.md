# MCP Helpy Helperton - Implementation Plan

## Design Decisions

### Language & Framework: Node.js with Blessed

**Choice**: Node.js with the `blessed` TUI library

**Rationale**:
- Claude Code ecosystem is Node.js-based (npm distribution)
- `blessed` is mature, well-documented, and handles terminal rendering well
- Easy npm distribution for end users
- Good cross-platform support (macOS, Windows, Linux)

**Alternatives Considered**:
- `ink` (React-based) - More complex setup, overkill for simple UI
- Python `curses` - Different ecosystem, harder npm distribution
- Rust `ratatui` - Excellent but different toolchain, slower iteration

### Configuration Storage: JSON

**Choice**: JSON for `helpy.json`

**Rationale**:
- Consistent with Claude Code's own config format
- Native Node.js parsing (no dependencies)
- Human-readable and editable if needed

### Storage Location

**Choice**:
- macOS/Linux: `~/.config/mcp-helperton/helpy.json`
- Windows: `%APPDATA%\mcp-helperton\helpy.json`

**Rationale**:
- Follows XDG Base Directory spec on Unix
- Standard Windows application data location
- Separate from Claude Code config to avoid conflicts

### Visual Design

**Choice**: Checkbox-style list with clear indicators

```
[✓] enabled-server
[ ] disabled-server
```

**Rationale**:
- Universal checkbox metaphor
- Clear visual distinction
- Works in monochrome terminals
- `>` prefix for selection cursor

---

## Architecture

```
src/
├── index.js          # Entry point, CLI setup
├── config.js         # Config file paths & I/O
├── claude-config.js  # Claude Code config operations
├── helpy-config.js   # Helpy storage operations
├── ui.js             # Blessed TUI setup
└── state.js          # Application state management
```

### Data Flow

```
┌─────────────────┐     ┌──────────────────┐
│ Claude Config   │     │  Helpy Config    │
│ (enabled MCPs)  │     │ (disabled MCPs)  │
└────────┬────────┘     └────────┬─────────┘
         │                       │
         └───────────┬───────────┘
                     │
              ┌──────▼──────┐
              │ Merged List │
              │  (UI State) │
              └──────┬──────┘
                     │
              ┌──────▼──────┐
              │     TUI     │
              └─────────────┘
```

---

## Implementation Tasks

### Phase 1: Project Setup
1. Initialize npm project with `package.json`
2. Add dependencies: `blessed`
3. Set up entry point with shebang for CLI

### Phase 2: Config Management
1. Implement platform-aware path resolution
2. Read Claude Code global config
3. Read/write helpy storage
4. Handle missing files gracefully

### Phase 3: Core Logic
1. Merge enabled + disabled MCPs into unified list
2. Track pending changes (not yet saved)
3. Implement enable operation (move from helpy → claude)
4. Implement disable operation (move from claude → helpy)

### Phase 4: TUI
1. Create blessed screen and list widget
2. Render MCP list with status indicators
3. Handle arrow key navigation
4. Handle Enter key for toggle
5. Handle 's' for save, 'q' for quit
6. Show status messages (saved, unsaved changes, etc.)

### Phase 5: Polish
1. Error handling and user feedback
2. Confirm quit with unsaved changes
3. Handle edge cases (empty config, permissions)
4. Cross-platform testing

### Phase 6: Distribution
1. Add bin field to package.json
2. Write npm publish metadata
3. Test global installation

---

## File Locations Reference

### Claude Code Config
- **All platforms**: `~/.claude.json`

Note: This is for Claude Code CLI, NOT Claude Desktop (which uses a different path).

### Helpy Config
- **macOS/Linux**: `~/.config/mcp-helperton/helpy.json`
- **Windows**: `%APPDATA%\mcp-helperton\helpy.json`

---

## Risk Mitigation

### Risk: Corrupt Claude Config
**Mitigation**:
- Parse and validate JSON before writing
- Create backup before first modification
- Atomic write (write to temp, then rename)

### Risk: Concurrent Modifications
**Mitigation**:
- Read fresh config on save (not cached from startup)
- Warn if config changed externally

### Risk: Permission Errors
**Mitigation**:
- Clear error messages
- Check permissions on startup

---

## Testing Strategy

1. **Unit tests**: Config read/write, merge logic
2. **Integration tests**: Full enable/disable cycle with mock files
3. **Manual testing**: Real Claude Code config on macOS

---

## Future Enhancements (Not in v1)

- Project-scope MCP management (`.mcp.json`)
- Add new MCPs from scratch
- View/edit MCP details
- Import/export configurations
- MCP health check (test if server starts)
