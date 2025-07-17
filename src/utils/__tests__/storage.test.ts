import {
  isStorageAvailable,
  getStorageInfo,
  saveTodoState,
  loadTodoState,
  clearTodoState,
  hasTodoData,
  StorageError
} from '../storage';
import { Todo, TodoState } from '../../types/todo';

// Test data
const mockTodo: Todo = {
  id: '1',
  title: 'Test Todo',
  completed: false,
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z')
};

const mockTodoState: TodoState = {
  todos: [mockTodo],
  filter: 'all'
};

describe('Storage Utilities', () => {
  let mockStorage: { [key: string]: string } = {};

  beforeEach(() => {
    // Reset storage
    mockStorage = {};
    
    // Mock localStorage
    Object.defineProperty(global, 'localStorage', {
      value: {
        getItem: jest.fn((key: string) => mockStorage[key] || null),
        setItem: jest.fn((key: string, value: string) => {
          mockStorage[key] = value;
        }),
        removeItem: jest.fn((key: string) => {
          delete mockStorage[key];
        }),
        clear: jest.fn(() => {
          mockStorage = {};
        }),
        get length() {
          return Object.keys(mockStorage).length;
        },
        key: jest.fn((index: number) => Object.keys(mockStorage)[index] || null),
        hasOwnProperty: (key: string) => key in mockStorage
      },
      writable: true
    });

    // Mock DOMException
    global.DOMException = class extends Error {
      constructor(message: string, name: string) {
        super(message);
        this.name = name;
      }
    } as any;
  });

  describe('isStorageAvailable', () => {
    it('should return true when localStorage is available', () => {
      expect(isStorageAvailable()).toBe(true);
    });

    it('should return false when localStorage throws an error', () => {
      const setItemSpy = jest.spyOn(localStorage, 'setItem');
      setItemSpy.mockImplementation(() => {
        throw new Error('Storage not available');
      });

      expect(isStorageAvailable()).toBe(false);

      setItemSpy.mockRestore();
    });
  });

  describe('getStorageInfo', () => {
    it('should return storage information when localStorage is available', () => {
      mockStorage['test-key'] = 'test-value';
      
      const info = getStorageInfo();
      
      expect(info).toHaveProperty('used');
      expect(info).toHaveProperty('available');
      expect(info).toHaveProperty('total');
      expect(info.used).toBeGreaterThan(0);
      expect(info.total).toBe(5 * 1024 * 1024); // 5MB
    });

    it('should return zeros when localStorage is not available', () => {
      const setItemSpy = jest.spyOn(localStorage, 'setItem');
      setItemSpy.mockImplementation(() => {
        throw new Error('Storage not available');
      });

      const info = getStorageInfo();
      
      expect(info).toEqual({ used: 0, available: 0, total: 0 });

      setItemSpy.mockRestore();
    });
  });

  describe('saveTodoState', () => {
    it('should save todo state to localStorage', () => {
      const setItemSpy = jest.spyOn(localStorage, 'setItem');
      
      saveTodoState(mockTodoState);

      expect(setItemSpy).toHaveBeenCalledWith(
        'todo-app-data',
        expect.stringContaining('"filter":"all"')
      );
    });

    it('should serialize dates correctly', () => {
      saveTodoState(mockTodoState);

      const savedData = mockStorage['todo-app-data'];
      const parsed = JSON.parse(savedData);
      const todosData = JSON.parse(parsed.todos);
      
      expect(todosData[0].createdAt).toBe('2024-01-01T00:00:00.000Z');
      expect(todosData[0].updatedAt).toBe('2024-01-01T00:00:00.000Z');
    });

    it('should throw StorageError when localStorage is not available', () => {
      const setItemSpy = jest.spyOn(localStorage, 'setItem');
      setItemSpy.mockImplementation(() => {
        throw new Error('Storage not available');
      });

      expect(() => saveTodoState(mockTodoState)).toThrow(StorageError);
      expect(() => saveTodoState(mockTodoState)).toThrow('localStorage is not available');

      setItemSpy.mockRestore();
    });

    it('should throw StorageError when quota is exceeded', () => {
      const setItemSpy = jest.spyOn(localStorage, 'setItem');
      
      // Mock setItem to handle both isStorageAvailable check and actual save
      setItemSpy.mockImplementation((key: string, value: string) => {
        if (key === '__storage_test__') {
          // Allow the storage availability test to pass
          mockStorage[key] = value;
          return;
        }
        // Throw quota exceeded for actual save operation
        const error = new DOMException('Quota exceeded', 'QuotaExceededError');
        throw error;
      });

      const removeItemSpy = jest.spyOn(localStorage, 'removeItem');
      removeItemSpy.mockImplementation((key: string) => {
        if (key === '__storage_test__') {
          delete mockStorage[key];
          return;
        }
      });

      expect(() => saveTodoState(mockTodoState)).toThrow(StorageError);
      expect(() => saveTodoState(mockTodoState)).toThrow('Storage quota exceeded');

      setItemSpy.mockRestore();
      removeItemSpy.mockRestore();
    });
  });

  describe('loadTodoState', () => {
    it('should load todo state from localStorage', () => {
      // First save some data
      saveTodoState(mockTodoState);
      
      // Then load it
      const loadedState = loadTodoState();
      
      expect(loadedState.filter).toBe('all');
      expect(loadedState.todos).toHaveLength(1);
      expect(loadedState.todos[0].id).toBe('1');
      expect(loadedState.todos[0].title).toBe('Test Todo');
      expect(loadedState.todos[0].completed).toBe(false);
    });

    it('should deserialize dates correctly', () => {
      saveTodoState(mockTodoState);
      const loadedState = loadTodoState();
      
      expect(loadedState.todos[0].createdAt).toBeInstanceOf(Date);
      expect(loadedState.todos[0].updatedAt).toBeInstanceOf(Date);
      expect(loadedState.todos[0].createdAt.toISOString()).toBe('2024-01-01T00:00:00.000Z');
    });

    it('should return default state when no data exists', () => {
      const state = loadTodoState();
      
      expect(state).toEqual({
        todos: [],
        filter: 'all'
      });
    });

    it('should return default state when localStorage is not available', () => {
      const getItemSpy = jest.spyOn(localStorage, 'getItem');
      getItemSpy.mockImplementation(() => {
        throw new Error('Storage not available');
      });

      const state = loadTodoState();
      
      expect(state).toEqual({
        todos: [],
        filter: 'all'
      });

      getItemSpy.mockRestore();
    });

    it('should return default state when stored data is corrupted', () => {
      mockStorage['todo-app-data'] = 'invalid-json';
      
      const state = loadTodoState();
      
      expect(state).toEqual({
        todos: [],
        filter: 'all'
      });
    });

    it('should handle invalid filter values gracefully', () => {
      const invalidData = {
        todos: '[]',
        filter: 'invalid-filter'
      };
      mockStorage['todo-app-data'] = JSON.stringify(invalidData);
      
      const state = loadTodoState();
      
      expect(state.filter).toBe('all');
    });
  });

  describe('clearTodoState', () => {
    it('should remove todo data from localStorage', () => {
      const removeItemSpy = jest.spyOn(localStorage, 'removeItem');
      
      saveTodoState(mockTodoState);
      expect(hasTodoData()).toBe(true);
      
      clearTodoState();
      
      expect(removeItemSpy).toHaveBeenCalledWith('todo-app-data');
      expect(hasTodoData()).toBe(false);
    });

    it('should throw StorageError when localStorage is not available', () => {
      const removeItemSpy = jest.spyOn(localStorage, 'removeItem');
      removeItemSpy.mockImplementation(() => {
        throw new Error('Storage not available');
      });

      expect(() => clearTodoState()).toThrow(StorageError);
      expect(() => clearTodoState()).toThrow('localStorage is not available');

      removeItemSpy.mockRestore();
    });
  });

  describe('hasTodoData', () => {
    it('should return true when todo data exists', () => {
      saveTodoState(mockTodoState);
      expect(hasTodoData()).toBe(true);
    });

    it('should return false when no todo data exists', () => {
      expect(hasTodoData()).toBe(false);
    });

    it('should return false when localStorage is not available', () => {
      const setItemSpy = jest.spyOn(localStorage, 'setItem');
      setItemSpy.mockImplementation(() => {
        throw new Error('Storage not available');
      });

      expect(hasTodoData()).toBe(false);

      setItemSpy.mockRestore();
    });
  });

  describe('StorageError', () => {
    it('should create StorageError with message', () => {
      const error = new StorageError('Test error');
      
      expect(error.name).toBe('StorageError');
      expect(error.message).toBe('Test error');
    });

    it('should create StorageError with cause', () => {
      const cause = new Error('Original error');
      const error = new StorageError('Test error', cause);
      
      expect(error.cause).toBe(cause);
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle todos with invalid date strings', () => {
      const invalidData = {
        todos: JSON.stringify([{
          id: '1',
          title: 'Test',
          completed: false,
          createdAt: 'invalid-date',
          updatedAt: 'invalid-date'
        }]),
        filter: 'all'
      };
      
      mockStorage['todo-app-data'] = JSON.stringify(invalidData);
      
      // Should return default state when deserialization fails
      const state = loadTodoState();
      expect(state).toEqual({
        todos: [],
        filter: 'all'
      });
    });

    it('should handle todos with missing required fields', () => {
      const invalidData = {
        todos: JSON.stringify([{
          id: '1',
          // missing title, completed, dates
        }]),
        filter: 'all'
      };
      
      mockStorage['todo-app-data'] = JSON.stringify(invalidData);
      
      const state = loadTodoState();
      expect(state).toEqual({
        todos: [],
        filter: 'all'
      });
    });

    it('should handle non-array todos data', () => {
      const invalidData = {
        todos: JSON.stringify({ not: 'an array' }),
        filter: 'all'
      };
      
      mockStorage['todo-app-data'] = JSON.stringify(invalidData);
      
      const state = loadTodoState();
      expect(state).toEqual({
        todos: [],
        filter: 'all'
      });
    });
  });
});