/**
 * Application state management
 * Handles merging configs and tracking changes
 */

const claudeConfig = require('./claude-config');
const helpyConfig = require('./helpy-config');

/**
 * @typedef {Object} McpServer
 * @property {string} name - Server name
 * @property {boolean} enabled - Whether server is currently enabled
 * @property {Object} config - Full server configuration
 */

/**
 * Create a new application state
 * @returns {Object} Application state object
 */
function createState() {
  return {
    servers: [],      // Array of McpServer objects
    selectedIndex: 0, // Currently selected server index
    hasChanges: false // Whether there are unsaved changes
  };
}

/**
 * Load servers from both Claude config and helpy storage
 * @param {Object} state - Application state
 * @returns {Object} Updated state
 */
function loadServers(state) {
  const enabledServers = claudeConfig.readClaudeConfig();
  const disabledServers = helpyConfig.readHelpyConfig();

  const servers = [];

  // Add enabled servers
  for (const [name, config] of Object.entries(enabledServers)) {
    servers.push({
      name,
      enabled: true,
      config
    });
  }

  // Add disabled servers (skip if name conflicts with enabled)
  for (const [name, config] of Object.entries(disabledServers)) {
    if (!enabledServers[name]) {
      servers.push({
        name,
        enabled: false,
        config
      });
    }
  }

  // Sort alphabetically by name
  servers.sort((a, b) => a.name.localeCompare(b.name));

  return {
    ...state,
    servers,
    selectedIndex: Math.min(state.selectedIndex, Math.max(0, servers.length - 1)),
    hasChanges: false
  };
}

/**
 * Toggle the enabled state of the selected server
 * @param {Object} state - Application state
 * @returns {Object} Updated state
 */
function toggleSelected(state) {
  if (state.servers.length === 0) {
    return state;
  }

  const servers = [...state.servers];
  const server = { ...servers[state.selectedIndex] };
  server.enabled = !server.enabled;
  servers[state.selectedIndex] = server;

  return {
    ...state,
    servers,
    hasChanges: true
  };
}

/**
 * Move selection up
 * @param {Object} state - Application state
 * @returns {Object} Updated state
 */
function moveUp(state) {
  if (state.servers.length === 0) {
    return state;
  }

  return {
    ...state,
    selectedIndex: Math.max(0, state.selectedIndex - 1)
  };
}

/**
 * Move selection down
 * @param {Object} state - Application state
 * @returns {Object} Updated state
 */
function moveDown(state) {
  if (state.servers.length === 0) {
    return state;
  }

  return {
    ...state,
    selectedIndex: Math.min(state.servers.length - 1, state.selectedIndex + 1)
  };
}

/**
 * Save current state to config files
 * @param {Object} state - Application state
 * @returns {Object} Updated state with hasChanges reset
 */
function saveState(state) {
  const enabledServers = {};
  const disabledServers = {};

  for (const server of state.servers) {
    if (server.enabled) {
      enabledServers[server.name] = server.config;
    } else {
      disabledServers[server.name] = server.config;
    }
  }

  // Write to both config files
  claudeConfig.writeClaudeConfig(enabledServers);
  helpyConfig.writeHelpyConfig(disabledServers);

  return {
    ...state,
    hasChanges: false
  };
}

/**
 * Get the currently selected server
 * @param {Object} state - Application state
 * @returns {McpServer|null} Selected server or null if none
 */
function getSelectedServer(state) {
  if (state.servers.length === 0 || state.selectedIndex < 0) {
    return null;
  }
  return state.servers[state.selectedIndex];
}

module.exports = {
  createState,
  loadServers,
  toggleSelected,
  moveUp,
  moveDown,
  saveState,
  getSelectedServer
};
