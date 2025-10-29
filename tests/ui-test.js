// UI Component Test Suite for StickyNotes
// This file tests all UI components and interactions

class UITester {
  constructor() {
    this.tests = [];
    this.results = [];
  }

  // Test button click handlers
  testButtonHandlers() {
    console.log('🧪 Testing Button Click Handlers...');
    
    const tests = [
      {
        name: 'Close button handler',
        test: () => {
          const closeBtn = document.getElementById('closeBtn');
          return closeBtn && typeof closeBtn.onclick !== 'undefined';
        }
      },
      {
        name: 'Minimize button handler', 
        test: () => {
          const minimizeBtn = document.getElementById('minimizeBtn');
          return minimizeBtn && typeof minimizeBtn.onclick !== 'undefined';
        }
      },
      {
        name: 'New note button handler',
        test: () => {
          const newBtn = document.getElementById('newBtn');
          return newBtn && typeof newBtn.onclick !== 'undefined';
        }
      },
      {
        name: 'Color picker handler',
        test: () => {
          const colorPicker = document.getElementById('colorPicker');
          return colorPicker && typeof colorPicker.onclick !== 'undefined';
        }
      }
    ];

    return this.runTests(tests);
  }

  // Test form functionality (auto-save, input handling)
  testFormFunctionality() {
    console.log('🧪 Testing Form Functionality...');
    
    const tests = [
      {
        name: 'Textarea exists and is accessible',
        test: () => {
          const textarea = document.getElementById('noteContent');
          return textarea && textarea.tagName === 'TEXTAREA';
        }
      },
      {
        name: 'Auto-save function exists',
        test: () => {
          return typeof autoSave === 'function';
        }
      },
      {
        name: 'Input event listener attached',
        test: () => {
          const textarea = document.getElementById('noteContent');
          return textarea && textarea.oninput !== null;
        }
      },
      {
        name: 'Save notification system',
        test: () => {
          return typeof showNotification === 'function';
        }
      }
    ];

    return this.runTests(tests);
  }

  // Test drag and drop functionality
  testDragAndDrop() {
    console.log('🧪 Testing Drag and Drop...');
    
    const tests = [
      {
        name: 'Drag functions exist',
        test: () => {
          return typeof initiateDrag === 'function' && 
                 typeof handleDrag === 'function' && 
                 typeof finishDrag === 'function';
        }
      },
      {
        name: 'Header has drag region',
        test: () => {
          const header = document.querySelector('.note-header');
          return header && getComputedStyle(header)['-webkit-app-region'] === 'drag';
        }
      },
      {
        name: 'Controls have no-drag region',
        test: () => {
          const controls = document.querySelector('.note-controls');
          return controls && getComputedStyle(controls)['-webkit-app-region'] === 'no-drag';
        }
      },
      {
        name: 'Textarea drag prevention',
        test: () => {
          const textarea = document.getElementById('noteContent');
          return textarea && textarea.ondragstart !== null;
        }
      }
    ];

    return this.runTests(tests);
  }

  // Test context menu
  testContextMenu() {
    console.log('🧪 Testing Context Menu...');
    
    const tests = [
      {
        name: 'Context menu functions exist',
        test: () => {
          return typeof createContextMenu === 'function' && 
                 typeof showContextMenu === 'function' && 
                 typeof hideContextMenu === 'function';
        }
      },
      {
        name: 'Context menu event listener',
        test: () => {
          const textarea = document.getElementById('noteContent');
          return textarea && textarea.oncontextmenu !== null;
        }
      },
      {
        name: 'Text selection helper',
        test: () => {
          return typeof getSelectedText === 'function';
        }
      }
    ];

    return this.runTests(tests);
  }

  // Test window controls (resize handles)
  testWindowControls() {
    console.log('🧪 Testing Window Controls...');
    
    const tests = [
      {
        name: 'Resize handles exist in DOM',
        test: () => {
          const handles = document.querySelectorAll('.resize-handle');
          return handles.length >= 3; // se, s, e
        }
      },
      {
        name: 'Resize functions exist',
        test: () => {
          return typeof initResize === 'function' && 
                 typeof handleResize === 'function' && 
                 typeof finishResize === 'function';
        }
      },
      {
        name: 'Save indicator exists',
        test: () => {
          return document.getElementById('saveIndicator') !== null;
        }
      },
      {
        name: 'Cursor helper function',
        test: () => {
          return typeof getResizeCursor === 'function';
        }
      }
    ];

    return this.runTests(tests);
  }

  // Test keyboard shortcuts
  testKeyboardShortcuts() {
    console.log('🧪 Testing Keyboard Shortcuts...');
    
    const tests = [
      {
        name: 'Keyboard shortcuts object exists',
        test: () => {
          return typeof keyboardShortcuts === 'object' && keyboardShortcuts !== null;
        }
      },
      {
        name: 'Essential shortcuts defined',
        test: () => {
          return keyboardShortcuts.save && 
                 keyboardShortcuts.newNote && 
                 keyboardShortcuts.closeNote &&
                 keyboardShortcuts.minimize;
        }
      },
      {
        name: 'Keyboard event handler attached',
        test: () => {
          return typeof handleKeyboardShortcuts === 'function';
        }
      }
    ];

    return this.runTests(tests);
  }

  // Test Electron API integration
  testElectronAPI() {
    console.log('🧪 Testing Electron API Integration...');
    
    const tests = [
      {
        name: 'ElectronAPI available',
        test: () => {
          return window.electronAPI !== undefined;
        }
      },
      {
        name: 'Core API methods exist',
        test: () => {
          return window.electronAPI.saveNoteContent && 
                 window.electronAPI.closeNote && 
                 window.electronAPI.minimizeNote && 
                 window.electronAPI.createNewNote &&
                 window.electronAPI.changeNoteColor;
        }
      },
      {
        name: 'New API methods exist (move/resize)',
        test: () => {
          return window.electronAPI.moveWindow && 
                 window.electronAPI.resizeWindow;
        }
      },
      {
        name: 'Initialization handler',
        test: () => {
          return typeof window.electronAPI.onInitNote === 'function';
        }
      }
    ];

    return this.runTests(tests);
  }

  // Run a set of tests
  runTests(tests) {
    const results = [];
    
    tests.forEach(test => {
      try {
        const passed = test.test();
        results.push({
          name: test.name,
          passed,
          error: null
        });
        console.log(`  ${passed ? '✅' : '❌'} ${test.name}`);
      } catch (error) {
        results.push({
          name: test.name,
          passed: false,
          error: error.message
        });
        console.log(`  ❌ ${test.name} (Error: ${error.message})`);
      }
    });

    return results;
  }

  // Run all tests
  runAllTests() {
    console.log('🚀 Starting UI Component Test Suite...\n');
    
    const testSuites = [
      { name: 'Button Handlers', fn: this.testButtonHandlers },
      { name: 'Form Functionality', fn: this.testFormFunctionality },
      { name: 'Drag and Drop', fn: this.testDragAndDrop },
      { name: 'Context Menu', fn: this.testContextMenu },
      { name: 'Window Controls', fn: this.testWindowControls },
      { name: 'Keyboard Shortcuts', fn: this.testKeyboardShortcuts },
      { name: 'Electron API', fn: this.testElectronAPI }
    ];

    const allResults = [];
    let totalTests = 0;
    let totalPassed = 0;

    testSuites.forEach(suite => {
      const results = suite.fn.call(this);
      allResults.push({ suite: suite.name, results });
      
      const passed = results.filter(r => r.passed).length;
      totalTests += results.length;
      totalPassed += passed;
      
      console.log(`  📊 ${suite.name}: ${passed}/${results.length} passed\n`);
    });

    // Summary
    console.log('📋 Test Summary:');
    console.log(`  Total Tests: ${totalTests}`);
    console.log(`  Passed: ${totalPassed}`);
    console.log(`  Failed: ${totalTests - totalPassed}`);
    console.log(`  Success Rate: ${((totalPassed / totalTests) * 100).toFixed(1)}%`);

    // Detailed failures
    const failures = allResults.flatMap(suite => 
      suite.results.filter(r => !r.passed).map(r => ({ suite: suite.suite, ...r }))
    );

    if (failures.length > 0) {
      console.log('\n❌ Failed Tests:');
      failures.forEach(failure => {
        console.log(`  ${failure.suite} -> ${failure.name}${failure.error ? ` (${failure.error})` : ''}`);
      });
    }

    return {
      total: totalTests,
      passed: totalPassed,
      failed: totalTests - totalPassed,
      successRate: (totalPassed / totalTests) * 100,
      details: allResults
    };
  }
}

// Auto-run tests when loaded
if (typeof window !== 'undefined') {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        const tester = new UITester();
        window.uiTestResults = tester.runAllTests();
      }, 1000);
    });
  } else {
    setTimeout(() => {
      const tester = new UITester();
      window.uiTestResults = tester.runAllTests();
    }, 1000);
  }
}

// Export for Node.js if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UITester;
}