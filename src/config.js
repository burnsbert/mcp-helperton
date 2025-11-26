/**
 * Platform-aware configuration path utilities
 */

const path = require('path');
const os = require('os');

/**
 * Get the path to Claude Code's global configuration file
 * @returns {string} Absolute path to .claude.json
 */
function getClaudeConfigPath() {
  const home = os.homedir();
  // Claude Code CLI stores config in ~/.claude.json (all platforms)
  return path.join(home, '.claude.json');
}

/**
 * Get the path to helpy's configuration directory
 * @returns {string} Absolute path to helpy config directory
 */
function getHelpyConfigDir() {
  const platform = os.platform();
  const home = os.homedir();

  switch (platform) {
    case 'win32':
      return path.join(process.env.APPDATA || path.join(home, 'AppData', 'Roaming'), 'mcp-helperton');
    case 'darwin':
    case 'linux':
    default:
      return path.join(home, '.config', 'mcp-helperton');
  }
}

/**
 * Get the path to helpy's storage file
 * @returns {string} Absolute path to helpy.json
 */
function getHelpyConfigPath() {
  return path.join(getHelpyConfigDir(), 'helpy.json');
}

module.exports = {
  getClaudeConfigPath,
  getHelpyConfigDir,
  getHelpyConfigPath
};
