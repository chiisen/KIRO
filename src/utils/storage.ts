import { Todo, TodoState, FilterType } from '../types/todo';

/**
 * Storage key for localStorage
 */
const STORAGE_KEY = 'todoState';

/**
 * Cache for storage operations to reduce localStorage access
 */
let storageCache: {
  data: TodoState | null;
  lastSaved: number;
  isDirty: boolean;
} = {
  data: null,
  lastSaved: 0,
  isDirty: false
};

/**
 * Debounce timeout for batch saving
 */
let saveTimeout: NodeJS.Timeout | null = null;

/**
 * Queue for pending save operations
 */
let saveQueue: TodoState[] = [];

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
 * Internal function to perform the actual save operation
 */
function performSave(state: TodoState): void {
  if (!isStorageAvailable()) {
    throw new StorageError('localStorage is not available');
  }

  try {
    const dataToStore = {
      todos: state.todos.map(todo => ({
        ...todo,
        createdAt: todo.createdAt.toISOString(),
        updatedAt: todo.updatedAt.toISOString()
      })),
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
    
    // Update cache
    storageCache.data = state;
    storageCache.lastSaved = Date.now();
    storageCache.isDirty = false;
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
 * Debounced save function to batch multiple save operations
 */
function debouncedSave(state: TodoState, delay: number = 500): void {
  // Add to save queue
  saveQueue.push(state);
  
  // Clear existing timeout
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  
  // Set new timeout
  saveTimeout = setTimeout(() => {
    if (saveQueue.length > 0) {
      // Get the latest state from queue
      const latestState = saveQueue[saveQueue.length - 1];
      saveQueue = []; // Clear queue
      
      try {
        performSave(latestState);
      } catch (error) {
        console.error('Debounced save failed:', error);
        // Could implement retry logic here
      }
    }
    saveTimeout = null;
  }, delay);
}

/**
 * Save todo state to localStorage with performance optimizations
 * Uses debouncing and caching to reduce localStorage operations
 */
export function saveTodoState(state: TodoState, immediate: boolean = false): void {
  // Check if data has actually changed
  if (storageCache.data && !hasStateChanged(storageCache.data, state)) {
    return; // No changes, skip save
  }
  
  // Mark cache as dirty
  storageCache.isDirty = true;
  
  if (immediate) {
    // Force immediate save
    if (saveTimeout) {
      clearTimeout(saveTimeout);
      saveTimeout = null;
    }
    saveQueue = [];
    performSave(state);
  } else {
    // Use debounced save
    debouncedSave(state);
  }
}

/**
 * Check if state has actually changed to avoid unnecessary saves
 */
function hasStateChanged(oldState: TodoState, newState: TodoState): boolean {
  // Quick reference check
  if (oldState === newState) {
    return false;
  }
  
  // Check filter
  if (oldState.filter !== newState.filter) {
    return true;
  }
  
  // Check todos array length
  if (oldState.todos.length !== newState.todos.length) {
    return true;
  }
  
  // Check each todo item
  for (let i = 0; i < oldState.todos.length; i++) {
    const oldTodo = oldState.todos[i];
    const newTodo = newState.todos[i];
    
    if (
      oldTodo.id !== newTodo.id ||
      oldTodo.title !== newTodo.title ||
      oldTodo.completed !== newTodo.completed ||
      oldTodo.createdAt.getTime() !== newTodo.createdAt.getTime() ||
      oldTodo.updatedAt.getTime() !== newTodo.updatedAt.getTime()
    ) {
      return true;
    }
  }
  
  return false;
}

/**
 * Load todo state from localStorage with caching
 */
export function loadTodoState(): TodoState {
  // Return cached data if available and not dirty
  if (storageCache.data && !storageCache.isDirty) {
    return storageCache.data;
  }

  if (!isStorageAvailable()) {
    console.warn('localStorage is not available, using default state');
    storageCache.data = DEFAULT_STATE;
    return DEFAULT_STATE;
  }

  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    
    if (!storedData) {
      storageCache.data = DEFAULT_STATE;
      return DEFAULT_STATE;
    }

    const parsed = JSON.parse(storedData);
    
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Invalid stored data format');
    }

    // Handle the new direct format
    const todos = parsed.todos ? parsed.todos.map((item: any) => {
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
    }) : [];
    
    const filter = parsed.filter && ['all', 'active', 'completed'].includes(parsed.filter) 
      ? parsed.filter as FilterType 
      : 'all';

    const loadedState = { todos, filter };
    
    // Update cache
    storageCache.data = loadedState;
    storageCache.lastSaved = Date.now();
    storageCache.isDirty = false;
    
    return loadedState;
  } catch (error) {
    console.error('Failed to load todo state:', error);
    // Return default state if loading fails
    storageCache.data = DEFAULT_STATE;
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

/**
 * Force flush any pending saves immediately
 * Useful for cleanup or when the app is about to close
 */
export function flushPendingSaves(): void {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
    saveTimeout = null;
  }
  
  if (saveQueue.length > 0) {
    const latestState = saveQueue[saveQueue.length - 1];
    saveQueue = [];
    
    try {
      performSave(latestState);
    } catch (error) {
      console.error('Failed to flush pending saves:', error);
    }
  }
}

/**
 * Clear storage cache
 * Useful for testing or when you want to force a fresh load
 */
export function clearStorageCache(): void {
  storageCache = {
    data: null,
    lastSaved: 0,
    isDirty: false
  };
}

/**
 * Get storage cache info for debugging
 */
export function getStorageCacheInfo(): {
  hasData: boolean;
  lastSaved: number;
  isDirty: boolean;
  pendingSaves: number;
} {
  return {
    hasData: storageCache.data !== null,
    lastSaved: storageCache.lastSaved,
    isDirty: storageCache.isDirty,
    pendingSaves: saveQueue.length
  };
}