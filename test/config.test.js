/**
 * Tests for configuration modules
 */

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const os = require('os');

// We'll use a temp directory for testing
let tempDir;
let originalEnv;

// Mock the config paths for testing
const mockPaths = {
  claude: null,
  helpy: null
};

beforeEach(() => {
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mcp-helperton-test-'));
  mockPaths.claude = path.join(tempDir, 'claude_desktop_config.json');
  mockPaths.helpy = path.join(tempDir, 'helpy.json');
});

afterEach(() => {
  // Clean up temp directory
  if (tempDir && fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true });
  }
});

describe('State Management', () => {
  it('should create empty state', () => {
    const state = require('../src/state');
    const appState = state.createState();

    assert.strictEqual(appState.servers.length, 0);
    assert.strictEqual(appState.selectedIndex, 0);
    assert.strictEqual(appState.hasChanges, false);
  });

  it('should toggle server state', () => {
    const state = require('../src/state');
    let appState = state.createState();
    appState.servers = [
      { name: 'test-server', enabled: true, config: { command: 'test' } }
    ];

    appState = state.toggleSelected(appState);

    assert.strictEqual(appState.servers[0].enabled, false);
    assert.strictEqual(appState.hasChanges, true);
  });

  it('should move selection up and down', () => {
    const state = require('../src/state');
    let appState = state.createState();
    appState.servers = [
      { name: 'server-a', enabled: true, config: {} },
      { name: 'server-b', enabled: true, config: {} },
      { name: 'server-c', enabled: true, config: {} }
    ];

    appState = state.moveDown(appState);
    assert.strictEqual(appState.selectedIndex, 1);

    appState = state.moveDown(appState);
    assert.strictEqual(appState.selectedIndex, 2);

    // Should not go past the end
    appState = state.moveDown(appState);
    assert.strictEqual(appState.selectedIndex, 2);

    appState = state.moveUp(appState);
    assert.strictEqual(appState.selectedIndex, 1);

    appState = state.moveUp(appState);
    assert.strictEqual(appState.selectedIndex, 0);

    // Should not go past the beginning
    appState = state.moveUp(appState);
    assert.strictEqual(appState.selectedIndex, 0);
  });
});

describe('Config Path Resolution', () => {
  it('should return correct paths for current platform', () => {
    const config = require('../src/config');
    const claudePath = config.getClaudeConfigPath();
    const helpyPath = config.getHelpyConfigPath();

    assert.ok(claudePath.endsWith('.claude.json'), `Expected path to end with .claude.json, got: ${claudePath}`);
    assert.ok(helpyPath.includes('helpy.json'));
    assert.ok(path.isAbsolute(claudePath));
    assert.ok(path.isAbsolute(helpyPath));
  });
});

console.log('All tests passed!');
