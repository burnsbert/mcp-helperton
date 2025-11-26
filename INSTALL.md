# Installation Guide

## Prerequisites

- **Node.js 18+**: Download from [nodejs.org](https://nodejs.org/) or use a version manager like nvm
- **Claude Code CLI**: Should be installed and configured with at least one MCP server

## Option 1: Install from npm (Recommended)

Once published to npm:

```bash
npm install -g mcp-helperton
```

This installs `mcp-helperton` globally and makes it available from any directory.

Verify installation:

```bash
mcp-helperton --version
```

## Option 2: Install from Source

1. **Clone the repository**

   ```bash
   git clone https://github.com/burnsbert/mcp-helperton.git
   cd mcp-helperton
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Link the package globally**

   ```bash
   npm link
   ```

   This creates a symlink so you can run `mcp-helperton` from any directory.

4. **Verify installation**

   ```bash
   mcp-helperton
   ```

## Troubleshooting

### Command not found

If you get "command not found" after installation:

1. **Check npm global bin directory is in PATH**

   ```bash
   npm bin -g
   ```

   Make sure this directory is in your `$PATH`. Add to your shell config (`.bashrc`, `.zshrc`, etc.):

   ```bash
   export PATH="$(npm bin -g):$PATH"
   ```

2. **Restart your terminal** or run:

   ```bash
   source ~/.zshrc  # or ~/.bashrc
   ```

### Permission errors

If you get permission errors during global install:

```bash
# Option A: Use sudo (not recommended)
sudo npm install -g mcp-helperton

# Option B: Fix npm permissions (recommended)
# See: https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally
```

### Using nvm

If you use nvm and switch Node versions, you may need to reinstall or relink:

```bash
npm link
```

## Uninstall

```bash
# If installed from npm
npm uninstall -g mcp-helperton

# If installed from source (run from repo directory)
npm unlink
```
