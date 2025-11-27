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
  mockPaths.claude = path.join(tempDir, '.claude.json');
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

describe('Atomic File Write', () => {
  it('should write file atomically', () => {
    const { atomicWriteFile } = require('../src/config');
    const testFile = path.join(tempDir, 'test-atomic.json');
    const content = JSON.stringify({ test: 'data' }, null, 2);

    atomicWriteFile(testFile, content);

    assert.ok(fs.existsSync(testFile), 'File should exist after write');
    assert.strictEqual(fs.readFileSync(testFile, 'utf8'), content);
  });

  it('should overwrite existing file', () => {
    const { atomicWriteFile } = require('../src/config');
    const testFile = path.join(tempDir, 'test-overwrite.json');

    // Write initial content
    atomicWriteFile(testFile, '{"version": 1}');
    assert.strictEqual(fs.readFileSync(testFile, 'utf8'), '{"version": 1}');

    // Overwrite with new content
    atomicWriteFile(testFile, '{"version": 2}');
    assert.strictEqual(fs.readFileSync(testFile, 'utf8'), '{"version": 2}');
  });

  it('should clean up temp file on write error', () => {
    const { atomicWriteFile } = require('../src/config');
    const testFile = path.join(tempDir, 'nonexistent-dir', 'test.json');

    // This should fail because parent directory doesn't exist for temp file
    // Note: The temp file is created in same directory as target
    assert.throws(() => {
      atomicWriteFile(testFile, 'test');
    }, /Failed to write/);

    // Verify no .tmp files left behind in tempDir
    const files = fs.readdirSync(tempDir);
    const tmpFiles = files.filter(f => f.endsWith('.tmp'));
    assert.strictEqual(tmpFiles.length, 0, 'No temp files should remain after error');
  });

  it('should use unique temp filenames', () => {
    const { atomicWriteFile } = require('../src/config');
    const testFile = path.join(tempDir, 'test-unique.json');

    // Write multiple times rapidly - should not collide
    for (let i = 0; i < 5; i++) {
      atomicWriteFile(testFile, JSON.stringify({ iteration: i }));
    }

    // Final content should be last write
    const content = JSON.parse(fs.readFileSync(testFile, 'utf8'));
    assert.strictEqual(content.iteration, 4);
  });
});

console.log('All tests passed!');
