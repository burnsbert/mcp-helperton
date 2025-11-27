/**
 * Claude Code CLI configuration file operations
 *
 * Claude Code stores its config in ~/.claude.json with structure:
 * {
 *   "mcpServers": { ... },       // Global MCP servers
 *   "projects": {                 // Per-project settings
 *     "/path/to/project": {
 *       "mcpServers": { ... }
 *     }
 *   }
 * }
 */

const fs = require('fs');
const path = require('path');
const { getClaudeConfigPath, atomicWriteFile } = require('./config');

/**
 * Read Claude Code's global MCP configuration
 * @returns {Object} The mcpServers object (empty object if file doesn't exist)
 */
function readClaudeConfig() {
  const configPath = getClaudeConfigPath();

  try {
    if (!fs.existsSync(configPath)) {
      return {};
    }

    const content = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(content);
    return config.mcpServers || {};
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {};
    }
    throw new Error(`Failed to read Claude config: ${error.message}`);
  }
}

/**
 * Read the full Claude config file
 * @returns {Object} The full config object
 */
function readFullClaudeConfig() {
  const configPath = getClaudeConfigPath();

  try {
    if (!fs.existsSync(configPath)) {
      return { mcpServers: {} };
    }

    const content = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return { mcpServers: {} };
    }
    throw new Error(`Failed to read Claude config: ${error.message}`);
  }
}

/**
 * Write MCP servers to Claude Code's global configuration
 * Preserves other config fields that may exist
 * @param {Object} mcpServers - The mcpServers object to write
 */
function writeClaudeConfig(mcpServers) {
  const configPath = getClaudeConfigPath();
  const configDir = path.dirname(configPath);

  // Ensure directory exists
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  // Read existing config to preserve other fields
  let existingConfig = {};
  try {
    if (fs.existsSync(configPath)) {
      const content = fs.readFileSync(configPath, 'utf8');
      existingConfig = JSON.parse(content);

      // Create backup on first write (only if backup doesn't exist)
      const backupPath = `${configPath}.helperton-backup`;
      if (!fs.existsSync(backupPath)) {
        fs.writeFileSync(backupPath, content, 'utf8');
      }
    }
  } catch (error) {
    // If we can't read it, start fresh
    existingConfig = {};
  }

  // Merge with existing config
  const newConfig = {
    ...existingConfig,
    mcpServers
  };

  // Write atomically with unique temp filename, retry logic, and cleanup
  atomicWriteFile(configPath, JSON.stringify(newConfig, null, 2));
}

/**
 * Add an MCP server to Claude config
 * @param {string} name - Server name
 * @param {Object} serverConfig - Server configuration
 */
function addServer(name, serverConfig) {
  const servers = readClaudeConfig();
  servers[name] = serverConfig;
  writeClaudeConfig(servers);
}

/**
 * Remove an MCP server from Claude config
 * @param {string} name - Server name
 * @returns {Object|null} The removed server config, or null if not found
 */
function removeServer(name) {
  const servers = readClaudeConfig();
  if (!servers[name]) {
    return null;
  }

  const removed = servers[name];
  delete servers[name];
  writeClaudeConfig(servers);
  return removed;
}

module.exports = {
  readClaudeConfig,
  readFullClaudeConfig,
  writeClaudeConfig,
  addServer,
  removeServer,
  getClaudeConfigPath
};
