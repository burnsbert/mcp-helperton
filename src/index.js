#!/usr/bin/env node

/**
 * MCP Helpy Helperton
 * A text-based UI for managing MCP servers in Claude Code
 */

const { createUI, renderList, setStatus, showConfirm } = require('./ui');
const state = require('./state');

// Initialize state
let appState = state.createState();

// Create UI
const ui = createUI();

// Load servers and render
function refresh() {
  appState = state.loadServers(appState);
  renderList(ui, appState);
  updateStatus();
}

// Update status line based on current state
function updateStatus() {
  if (appState.servers.length === 0) {
    setStatus(ui, 'No MCP servers configured', 'gray');
  } else if (appState.hasChanges) {
    setStatus(ui, '* Unsaved changes (press s to save)', 'yellow');
  } else {
    setStatus(ui, '', 'gray');
  }
}

// Clean exit - destroy screen before exiting to restore terminal
function cleanExit(code = 0) {
  ui.screen.destroy();
  process.exit(code);
}

// Handle quit
function handleQuit() {
  if (appState.hasChanges) {
    showConfirm(
      ui,
      'Discard unsaved changes?',
      () => cleanExit(0),
      () => {} // Do nothing, stay in app
    );
  } else {
    cleanExit(0);
  }
}

// Handle save and quit
function handleSave() {
  try {
    appState = state.saveState(appState);
    setStatus(ui, 'Saved!', 'green');
    setTimeout(() => cleanExit(0), 500);
  } catch (error) {
    setStatus(ui, `Error: ${error.message}`, 'red');
  }
}

// Keyboard handlers
ui.screen.key(['up', 'k'], () => {
  appState = state.moveUp(appState);
  renderList(ui, appState);
});

ui.screen.key(['down', 'j'], () => {
  appState = state.moveDown(appState);
  renderList(ui, appState);
});

ui.screen.key(['enter', 'space'], () => {
  appState = state.toggleSelected(appState);
  renderList(ui, appState);
  updateStatus();
});

ui.screen.key(['s', 'S'], () => {
  handleSave();
});

ui.screen.key(['q', 'Q', 'escape'], () => {
  handleQuit();
});

// Also handle C-c
ui.screen.key(['C-c'], () => {
  handleQuit();
});

// Initial load
refresh();

// Focus the screen
ui.screen.render();
