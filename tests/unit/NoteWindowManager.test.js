const NoteWindowManager = require('../../src/managers/NoteWindowManager');
const { BrowserWindow, screen } = require('electron');

// Mock Electron modules
jest.mock('electron', () => ({
  BrowserWindow: jest.fn(),
  screen: {
    getPrimaryDisplay: jest.fn(() => ({
      workAreaSize: { width: 1920, height: 1080 }
    }))
  }
}));

describe('NoteWindowManager', () => {
  let manager;
  let mockStore;
  let mockWindow;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Mock store
    mockStore = {
      get: jest.fn((key, defaultValue) => {
        const values = {
          'lastNoteId': 0,
          'settings.maxNotes': 50
        };
        return values[key] !== undefined ? values[key] : defaultValue;
      }),
      set: jest.fn()
    };

    // Mock BrowserWindow instance
    mockWindow = {
      loadFile: jest.fn(),
      on: jest.fn(),
      show: jest.fn(),
      focus: jest.fn(),
      close: jest.fn(),
      isDestroyed: jest.fn(() => false),
      removeListener: jest.fn(),
      getBounds: jest.fn(() => ({ x: 100, y: 100, width: 300, height: 300 })),
      webContents: {
        on: jest.fn(),
        send: jest.fn(),
        session: {
          webRequest: {
            onHeadersReceived: jest.fn()
          }
        }
      }
    };

    BrowserWindow.mockImplementation(() => mockWindow);
    
    // Create manager instance
    manager = new NoteWindowManager(mockStore);
  });

  describe('constructor', () => {
    test('should initialize with empty maps and counters', () => {
      expect(manager.windows.size).toBe(0);
      expect(manager.listeners.size).toBe(0);
      expect(manager.intervals.size).toBe(0);
      expect(manager.noteIdCounter).toBe(0);
    });

    test('should set store reference', () => {
      expect(manager.store).toBe(mockStore);
    });
  });

  describe('createNote', () => {
    test('should create a new note with unique ID', () => {
      const window = manager.createNote();
      
      expect(window).toBe(mockWindow);
      expect(manager.windows.size).toBe(1);
      expect(BrowserWindow).toHaveBeenCalledTimes(1);
    });

    test('should respect maximum note limit', () => {
      // Set manager to have max notes
      for (let i = 0; i < 50; i++) {
        manager.windows.set(`note_${i}`, { window: mockWindow });
      }

      const window = manager.createNote();
      
      expect(window).toBeNull();
      expect(BrowserWindow).not.toHaveBeenCalled();
    });

    test('should prevent duplicate note IDs', () => {
      const savedData = { id: 'note_1' };
      manager.createNote(savedData);
      
      const duplicate = manager.createNote(savedData);
      
      expect(duplicate).toBe(mockWindow);
      expect(manager.windows.size).toBe(1);
    });

    test('should setup security restrictions', () => {
      manager.createNote();
      
      expect(mockWindow.webContents.on).toHaveBeenCalledWith('will-navigate', expect.any(Function));
      expect(mockWindow.webContents.on).toHaveBeenCalledWith('new-window', expect.any(Function));
      expect(mockWindow.webContents.on).toHaveBeenCalledWith('will-attach-webview', expect.any(Function));
    });

    test('should track event listeners', () => {
      manager.createNote();
      
      const noteId = Array.from(manager.windows.keys())[0];
      expect(manager.listeners.has(noteId)).toBe(true);
      expect(manager.listeners.get(noteId).length).toBeGreaterThan(0);
    });

    test('should cascade window positions', () => {
      const window1 = manager.createNote();
      const window2 = manager.createNote();
      
      expect(manager.windows.size).toBe(2);
      // Check that different positions were calculated
      expect(BrowserWindow).toHaveBeenCalledTimes(2);
    });

    test('should respect saved bounds', () => {
      const savedData = {
        id: 'note_1',
        bounds: { x: 500, y: 500, width: 400, height: 400 }
      };
      
      manager.createNote(savedData);
      
      expect(BrowserWindow).toHaveBeenCalledWith(
        expect.objectContaining({
          x: 500,
          y: 500,
          width: 400,
          height: 400
        })
      );
    });
  });

  describe('cleanup', () => {
    test('should remove all resources for a note', () => {
      manager.createNote();
      const noteId = Array.from(manager.windows.keys())[0];
      
      manager.cleanup(noteId);
      
      expect(manager.windows.has(noteId)).toBe(false);
      expect(manager.listeners.has(noteId)).toBe(false);
      expect(manager.intervals.has(noteId)).toBe(false);
    });

    test('should remove event listeners from window', () => {
      manager.createNote();
      const noteId = Array.from(manager.windows.keys())[0];
      
      // Add some listeners to track
      const listeners = [
        { event: 'moved', handler: jest.fn() },
        { event: 'resized', handler: jest.fn() }
      ];
      manager.listeners.set(noteId, listeners);
      
      manager.cleanup(noteId);
      
      expect(mockWindow.removeListener).toHaveBeenCalled();
    });

    test('should clear timeouts and intervals', () => {
      manager.createNote();
      const noteId = Array.from(manager.windows.keys())[0];
      
      const mockInterval = 123;
      manager.intervals.set(noteId, mockInterval);
      
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
      
      manager.cleanup(noteId);
      
      expect(clearTimeoutSpy).toHaveBeenCalledWith(mockInterval);
      expect(clearIntervalSpy).toHaveBeenCalledWith(mockInterval);
      
      clearTimeoutSpy.mockRestore();
      clearIntervalSpy.mockRestore();
    });

    test('should close window if not destroyed', () => {
      manager.createNote();
      const noteId = Array.from(manager.windows.keys())[0];
      
      manager.cleanup(noteId);
      
      expect(mockWindow.close).toHaveBeenCalled();
    });

    test('should handle cleanup of non-existent note', () => {
      expect(() => manager.cleanup('non_existent')).not.toThrow();
    });
  });

  describe('cleanupAll', () => {
    test('should cleanup all notes', () => {
      manager.createNote();
      manager.createNote();
      manager.createNote();
      
      expect(manager.windows.size).toBe(3);
      
      manager.cleanupAll();
      
      expect(manager.windows.size).toBe(0);
      expect(manager.listeners.size).toBe(0);
      expect(manager.intervals.size).toBe(0);
    });

    test('should handle empty state', () => {
      expect(() => manager.cleanupAll()).not.toThrow();
    });
  });

  describe('getAllNotesData', () => {
    test('should return data for all valid notes', () => {
      manager.createNote({ content: 'Note 1', color: 'gradient-1' });
      manager.createNote({ content: 'Note 2', color: 'gradient-2' });
      
      const notesData = manager.getAllNotesData();
      
      expect(notesData).toHaveLength(2);
      expect(notesData[0]).toHaveProperty('id');
      expect(notesData[0]).toHaveProperty('content');
      expect(notesData[0]).toHaveProperty('color');
      expect(notesData[0]).toHaveProperty('bounds');
    });

    test('should skip destroyed windows', () => {
      manager.createNote();
      mockWindow.isDestroyed.mockReturnValue(true);
      
      const notesData = manager.getAllNotesData();
      
      expect(notesData).toHaveLength(0);
    });
  });

  describe('updateNoteContent', () => {
    test('should update note content and modified time', () => {
      manager.createNote();
      const noteId = Array.from(manager.windows.keys())[0];
      
      const newContent = 'Updated content';
      manager.updateNoteContent(noteId, newContent);
      
      const noteData = manager.windows.get(noteId);
      expect(noteData.content).toBe(newContent);
      expect(noteData.modified).toBeDefined();
    });

    test('should handle non-existent note', () => {
      expect(() => manager.updateNoteContent('non_existent', 'content')).not.toThrow();
    });
  });

  describe('updateNoteColor', () => {
    test('should update note color and modified time', () => {
      manager.createNote();
      const noteId = Array.from(manager.windows.keys())[0];
      
      const newColor = 'gradient-5';
      manager.updateNoteColor(noteId, newColor);
      
      const noteData = manager.windows.get(noteId);
      expect(noteData.color).toBe(newColor);
      expect(noteData.modified).toBeDefined();
    });
  });

  describe('utility methods', () => {
    test('getNote should return note data', () => {
      manager.createNote();
      const noteId = Array.from(manager.windows.keys())[0];
      
      const note = manager.getNote(noteId);
      
      expect(note).toBeDefined();
      expect(note.id).toBe(noteId);
    });

    test('getAllNotes should return all windows', () => {
      manager.createNote();
      manager.createNote();
      
      const allNotes = manager.getAllNotes();
      
      expect(allNotes).toBe(manager.windows);
      expect(allNotes.size).toBe(2);
    });

    test('getNoteCount should return correct count', () => {
      manager.createNote();
      manager.createNote();
      
      expect(manager.getNoteCount()).toBe(2);
    });

    test('hasNote should check existence', () => {
      manager.createNote();
      const noteId = Array.from(manager.windows.keys())[0];
      
      expect(manager.hasNote(noteId)).toBe(true);
      expect(manager.hasNote('non_existent')).toBe(false);
    });

    test('should manage note ID counter', () => {
      expect(manager.getNoteIdCounter()).toBe(0);
      
      manager.setNoteIdCounter(10);
      expect(manager.getNoteIdCounter()).toBe(10);
    });
  });

  describe('setSaveCallback', () => {
    test('should set save callback function', () => {
      const callback = jest.fn();
      manager.setSaveCallback(callback);
      
      expect(manager.saveCallback).toBe(callback);
    });

    test('should trigger save callback on cleanup', () => {
      const callback = jest.fn();
      manager.setSaveCallback(callback);
      
      manager.createNote();
      const noteId = Array.from(manager.windows.keys())[0];
      
      manager.cleanup(noteId);
      
      expect(callback).toHaveBeenCalled();
    });
  });

  describe('memory leak prevention', () => {
    test('should not accumulate listeners over time', () => {
      const noteIds = [];
      
      // Create and cleanup many notes
      for (let i = 0; i < 100; i++) {
        manager.createNote();
        const noteId = Array.from(manager.windows.keys())[0];
        noteIds.push(noteId);
        manager.cleanup(noteId);
      }
      
      expect(manager.windows.size).toBe(0);
      expect(manager.listeners.size).toBe(0);
      expect(manager.intervals.size).toBe(0);
    });

    test('should handle rapid creation and deletion', () => {
      const operations = [];
      
      for (let i = 0; i < 50; i++) {
        operations.push(() => {
          const window = manager.createNote();
          if (window && manager.windows.size > 0) {
            const noteId = Array.from(manager.windows.keys())[0];
            manager.cleanup(noteId);
          }
        });
      }
      
      operations.forEach(op => op());
      
      expect(manager.windows.size).toBe(0);
    });
  });
});