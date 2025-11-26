/**
 * Helpy Helperton's storage for disabled MCP servers
 */

const fs = require('fs');
const path = require('path');
const { getHelpyConfigPath, getHelpyConfigDir } = require('./config');

/**
 * Read helpy's storage of disabled servers
 * @returns {Object} The disabledServers object (empty object if file doesn't exist)
 */
function readHelpyConfig() {
  const configPath = getHelpyConfigPath();

  try {
    if (!fs.existsSync(configPath)) {
      return {};
    }

    const content = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(content);
    return config.disabledServers || {};
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {};
    }
    throw new Error(`Failed to read helpy config: ${error.message}`);
  }
}

/**
 * Write disabled servers to helpy's storage
 * @param {Object} disabledServers - The disabledServers object to write
 */
function writeHelpyConfig(disabledServers) {
  const configPath = getHelpyConfigPath();
  const configDir = getHelpyConfigDir();

  // Ensure directory exists
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  const config = {
    disabledServers,
    _meta: {
      version: 1,
      lastModified: new Date().toISOString()
    }
  };

  // Write atomically (write to temp, then rename)
  const tempPath = `${configPath}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(config, null, 2), 'utf8');
  fs.renameSync(tempPath, configPath);
}

/**
 * Add a server to helpy's disabled storage
 * @param {string} name - Server name
 * @param {Object} serverConfig - Server configuration
 */
function addDisabledServer(name, serverConfig) {
  const disabled = readHelpyConfig();
  disabled[name] = serverConfig;
  writeHelpyConfig(disabled);
}

/**
 * Remove a server from helpy's disabled storage
 * @param {string} name - Server name
 * @returns {Object|null} The removed server config, or null if not found
 */
function removeDisabledServer(name) {
  const disabled = readHelpyConfig();
  if (!disabled[name]) {
    return null;
  }

  const removed = disabled[name];
  delete disabled[name];
  writeHelpyConfig(disabled);
  return removed;
}

/**
 * Check if a server is in disabled storage
 * @param {string} name - Server name
 * @returns {boolean}
 */
function isDisabled(name) {
  const disabled = readHelpyConfig();
  return name in disabled;
}

module.exports = {
  readHelpyConfig,
  writeHelpyConfig,
  addDisabledServer,
  removeDisabledServer,
  isDisabled,
  getHelpyConfigPath
};
