import { Todo, TodoState, FilterType } from '../types/todo';

/**
 * Storage key for localStorage
 */
const STORAGE_KEY = 'todo-app-data';

/**
 * Default state when no data exists in localStorage
 */
const DEFAULT_STATE: TodoState = {
  todos: [],
  filter: 'all' as FilterType
};

/**
 * Error types for storage operations
 */
export class StorageError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'StorageError';
  }
}

/**
 * Check if localStorage is available and functional
 */
export function isStorageAvailable(): boolean {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get available localStorage space (approximate)
 */
export function getStorageInfo(): { used: number; available: number; total: number } {
  if (!isStorageAvailable()) {
    return { used: 0, available: 0, total: 0 };
  }

  let used = 0;
  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      used += localStorage[key].length + key.length;
    }
  }

  // Most browsers have ~5-10MB limit, we'll use 5MB as conservative estimate
  const total = 5 * 1024 * 1024; // 5MB in bytes
  const available = total - used;

  return { used, available, total };
}

/**
 * Serialize Todo data for storage
 * Converts Date objects to ISO strings for JSON compatibility
 */
function serializeTodos(todos: Todo[]): string {
  try {
    const serializable = todos.map(todo => ({
      ...todo,
      createdAt: todo.createdAt.toISOString(),
      updatedAt: todo.updatedAt.toISOString()
    }));
    return JSON.stringify(serializable);
  } catch (error) {
    throw new StorageError('Failed to serialize todos', error as Error);
  }
}

/**
 * Deserialize Todo data from storage
 * Converts ISO strings back to Date objects
 */
function deserializeTodos(data: string): Todo[] {
  try {
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) {
      throw new Error('Invalid data format: expected array');
    }

    return parsed.map(item => {
      if (!item.id || typeof item.title !== 'string' || typeof item.completed !== 'boolean') {
        throw new Error('Invalid todo item format');
      }

      const createdAt = new Date(item.createdAt);
      const updatedAt = new Date(item.updatedAt);

      // Check if dates are valid
      if (isNaN(createdAt.getTime()) || isNaN(updatedAt.getTime())) {
        throw new Error('Invalid date format');
      }

      return {
        ...item,
        createdAt,
        updatedAt
      } as Todo;
    });
  } catch (error) {
    throw new StorageError('Failed to deserialize todos', error as Error);
  }
}

/**
 * Save todo state to localStorage
 */
export function saveTodoState(state: TodoState): void {
  if (!isStorageAvailable()) {
    throw new StorageError('localStorage is not available');
  }

  try {
    const dataToStore = {
      todos: serializeTodos(state.todos),
      filter: state.filter
    };

    const serializedData = JSON.stringify(dataToStore);
    
    // Check if we have enough space
    const storageInfo = getStorageInfo();
    const dataSize = serializedData.length;
    
    if (dataSize > storageInfo.available) {
      throw new StorageError(`Not enough storage space. Need ${dataSize} bytes, but only ${storageInfo.available} bytes available`);
    }

    localStorage.setItem(STORAGE_KEY, serializedData);
  } catch (error) {
    if (error instanceof StorageError) {
      throw error;
    }
    
    // Handle quota exceeded error specifically
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      throw new StorageError('Storage quota exceeded', error);
    }
    
    throw new StorageError('Failed to save todo state', error as Error);
  }
}

/**
 * Load todo state from localStorage
 */
export function loadTodoState(): TodoState {
  if (!isStorageAvailable()) {
    console.warn('localStorage is not available, using default state');
    return DEFAULT_STATE;
  }

  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    
    if (!storedData) {
      return DEFAULT_STATE;
    }

    const parsed = JSON.parse(storedData);
    
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Invalid stored data format');
    }

    const todos = parsed.todos ? deserializeTodos(parsed.todos) : [];
    const filter = parsed.filter && ['all', 'active', 'completed'].includes(parsed.filter) 
      ? parsed.filter as FilterType 
      : 'all';

    return { todos, filter };
  } catch (error) {
    console.error('Failed to load todo state:', error);
    // Return default state if loading fails
    return DEFAULT_STATE;
  }
}

/**
 * Clear all todo data from localStorage
 */
export function clearTodoState(): void {
  if (!isStorageAvailable()) {
    throw new StorageError('localStorage is not available');
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    throw new StorageError('Failed to clear todo state', error as Error);
  }
}

/**
 * Check if todo data exists in localStorage
 */
export function hasTodoData(): boolean {
  if (!isStorageAvailable()) {
    return false;
  }

  return localStorage.getItem(STORAGE_KEY) !== null;
}