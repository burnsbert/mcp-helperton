/**
 * Text-based UI using blessed
 */

const blessed = require('blessed');

/**
 * Create the blessed screen and widgets
 * @returns {Object} Object containing screen and widget references
 */
function createUI() {
  // Create screen
  const screen = blessed.screen({
    smartCSR: true,
    title: 'MCP Helpy Helperton'
  });

  // Main container box
  const mainBox = blessed.box({
    parent: screen,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    border: {
      type: 'line'
    },
    style: {
      border: {
        fg: 'cyan'
      }
    }
  });

  // Title
  const title = blessed.text({
    parent: mainBox,
    top: 0,
    left: 'center',
    content: ' MCP Helpy Helperton ',
    style: {
      fg: 'white',
      bold: true
    }
  });

  // Server list area
  const listBox = blessed.box({
    parent: mainBox,
    top: 2,
    left: 1,
    right: 1,
    bottom: 4,
    scrollable: true,
    alwaysScroll: true,
    scrollbar: {
      ch: '│',
      style: {
        fg: 'cyan'
      }
    }
  });

  // Status line (shows unsaved changes, etc.)
  const statusLine = blessed.text({
    parent: mainBox,
    bottom: 2,
    left: 2,
    content: '',
    style: {
      fg: 'yellow'
    }
  });

  // Help line
  const helpLine = blessed.text({
    parent: mainBox,
    bottom: 0,
    left: 'center',
    content: ' ↑↓ Navigate  Enter Toggle  s Save & Quit  q Quit ',
    style: {
      fg: 'gray'
    }
  });

  return {
    screen,
    mainBox,
    listBox,
    statusLine,
    helpLine
  };
}

/**
 * Render the server list
 * @param {Object} ui - UI object from createUI
 * @param {Object} state - Application state
 */
function renderList(ui, state) {
  // Clear existing content
  ui.listBox.children.forEach(child => child.destroy());

  if (state.servers.length === 0) {
    blessed.text({
      parent: ui.listBox,
      top: 0,
      left: 0,
      content: '  No MCP servers found.',
      style: {
        fg: 'gray'
      }
    });
    ui.screen.render();
    return;
  }

  // Render each server
  state.servers.forEach((server, index) => {
    const isSelected = index === state.selectedIndex;
    const checkbox = server.enabled ? '[✓]' : '[ ]';
    const prefix = isSelected ? '>' : ' ';
    const content = `${prefix} ${checkbox} ${server.name}`;

    blessed.text({
      parent: ui.listBox,
      top: index,
      left: 0,
      content,
      style: {
        fg: isSelected ? 'white' : (server.enabled ? 'green' : 'gray'),
        bold: isSelected
      }
    });
  });

  // Ensure selected item is visible (scroll if needed)
  const visibleHeight = ui.listBox.height - 2;
  const scrollTop = ui.listBox.childBase || 0;

  if (state.selectedIndex < scrollTop) {
    ui.listBox.scrollTo(state.selectedIndex);
  } else if (state.selectedIndex >= scrollTop + visibleHeight) {
    ui.listBox.scrollTo(state.selectedIndex - visibleHeight + 1);
  }

  ui.screen.render();
}

/**
 * Update the status line
 * @param {Object} ui - UI object from createUI
 * @param {string} message - Status message
 * @param {string} [style='yellow'] - Text color
 */
function setStatus(ui, message, style = 'yellow') {
  ui.statusLine.setContent(message);
  ui.statusLine.style.fg = style;
  ui.screen.render();
}

/**
 * Show a confirmation dialog
 * @param {Object} ui - UI object from createUI
 * @param {string} message - Confirmation message
 * @param {Function} onConfirm - Called if user confirms
 * @param {Function} onCancel - Called if user cancels
 */
function showConfirm(ui, message, onConfirm, onCancel) {
  const dialog = blessed.box({
    parent: ui.screen,
    top: 'center',
    left: 'center',
    width: 50,
    height: 7,
    border: {
      type: 'line'
    },
    style: {
      border: {
        fg: 'yellow'
      },
      bg: 'black'
    }
  });

  blessed.text({
    parent: dialog,
    top: 1,
    left: 'center',
    content: message,
    style: {
      fg: 'white'
    }
  });

  blessed.text({
    parent: dialog,
    top: 3,
    left: 'center',
    content: '[y] Yes  [n] No',
    style: {
      fg: 'gray'
    }
  });

  const cleanup = () => {
    dialog.destroy();
    ui.screen.render();
  };

  const keyHandler = (ch, key) => {
    if (ch === 'y' || ch === 'Y') {
      ui.screen.unkey(['y', 'Y', 'n', 'N', 'escape'], keyHandler);
      cleanup();
      onConfirm();
    } else if (ch === 'n' || ch === 'N' || key.name === 'escape') {
      ui.screen.unkey(['y', 'Y', 'n', 'N', 'escape'], keyHandler);
      cleanup();
      onCancel();
    }
  };

  ui.screen.key(['y', 'Y', 'n', 'N', 'escape'], keyHandler);
  ui.screen.render();
}

module.exports = {
  createUI,
  renderList,
  setStatus,
  showConfirm
};
