/**
 * Core Todo interface representing a single todo item
 */
export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Filter types for displaying different subsets of todos
 */
export type FilterType = 'all' | 'active' | 'completed';

/**
 * Application state interface
 */
export interface TodoState {
  todos: Todo[];
  filter: FilterType;
}

/**
 * Action types for state management
 */
export type TodoAction = 
  | { type: 'ADD_TODO'; payload: { title: string } }
  | { type: 'TOGGLE_TODO'; payload: { id: string } }
  | { type: 'UPDATE_TODO'; payload: { id: string; title: string } }
  | { type: 'DELETE_TODO'; payload: { id: string } }
  | { type: 'SET_FILTER'; payload: { filter: FilterType } }
  | { type: 'LOAD_TODOS'; payload: { todos: Todo[] } };

/**
 * Statistics interface for todo counts
 */
export interface TodoStats {
  total: number;
  completed: number;
  active: number;
  completionPercentage: number;
}