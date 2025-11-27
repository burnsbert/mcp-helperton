/**
 * Platform-aware configuration path utilities and atomic file operations
 */

const fs = require('fs');
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

/**
 * Synchronous sleep for retry delays
 * @param {number} ms - Milliseconds to sleep
 */
function sleepSync(ms) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    // Busy wait - only used for brief retry delays
  }
}

/**
 * Write a file atomically using temp-file-then-rename pattern.
 * Handles Windows-specific issues:
 * - Uses unique temp filename to prevent collision with concurrent processes
 * - Retries on EPERM/EACCES errors (common with antivirus or file locking)
 * - Cleans up temp file on failure
 *
 * @param {string} filePath - Target file path
 * @param {string} content - Content to write
 * @param {Object} options - Options
 * @param {number} options.maxRetries - Max retry attempts for rename (default: 3)
 * @param {number} options.retryDelay - Base delay between retries in ms (default: 100)
 */
function atomicWriteFile(filePath, content, options = {}) {
  const { maxRetries = 3, retryDelay = 100 } = options;

  // Unique temp filename prevents collision with concurrent processes
  // process.pid + Date.now() provides sufficient uniqueness for non-adversarial environments
  const tempPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;

  try {
    // Write to temp file first
    fs.writeFileSync(tempPath, content, 'utf8');

    // Attempt rename with retries for Windows locking issues
    let lastError;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // fs.renameSync automatically overwrites existing target file
        // (uses MoveFileEx with MOVEFILE_REPLACE_EXISTING on Windows)
        fs.renameSync(tempPath, filePath);
        return; // Success!
      } catch (error) {
        lastError = error;

        // Retry on EPERM/EACCES (Windows antivirus, file locking)
        if ((error.code === 'EPERM' || error.code === 'EACCES') && attempt < maxRetries - 1) {
          // Exponential backoff: 100ms, 200ms, 400ms...
          sleepSync(retryDelay * Math.pow(2, attempt));
          continue;
        }

        // Non-retryable error or max retries exceeded
        throw error;
      }
    }

    throw lastError;
  } catch (error) {
    // Clean up temp file on any failure
    try {
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
    } catch {
      // Ignore cleanup errors
    }

    throw new Error(`Failed to write ${filePath}: ${error.message}`);
  }
}

module.exports = {
  getClaudeConfigPath,
  getHelpyConfigDir,
  getHelpyConfigPath,
  atomicWriteFile
};
