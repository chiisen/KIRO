import { useContext, useMemo } from 'react';
import { TodoContext } from '../context/TodoContext';
import { Todo, FilterType, TodoStats } from '../types/todo';

/**
 * Custom hook error class
 */
export class TodoHookError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TodoHookError';
  }
}

/**
 * Custom hook for managing todos
 * Provides convenient CRUD operations and computed values
 */
export function useTodos() {
  const context = useContext(TodoContext);

  if (!context) {
    throw new TodoHookError('useTodos must be used within a TodoProvider');
  }

  const { state, dispatch } = context;

  // Computed values
  const filteredTodos = useMemo(() => {
    switch (state.filter) {
      case 'active':
        return state.todos.filter(todo => !todo.completed);
      case 'completed':
        return state.todos.filter(todo => todo.completed);
      case 'all':
      default:
        return state.todos;
    }
  }, [state.todos, state.filter]);

  const stats = useMemo((): TodoStats => {
    const total = state.todos.length;
    const completed = state.todos.filter(todo => todo.completed).length;
    const active = total - completed;
    const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      active,
      completionPercentage
    };
  }, [state.todos]);

  // Action creators with error handling
  const addTodo = (title: string) => {
    try {
      if (!title || typeof title !== 'string') {
        throw new TodoHookError('Title must be a non-empty string');
      }

      if (title.trim().length === 0) {
        throw new TodoHookError('Title cannot be empty or only whitespace');
      }

      if (title.length > 200) {
        throw new TodoHookError('Title cannot exceed 200 characters');
      }

      dispatch({
        type: 'ADD_TODO',
        payload: { title }
      });
    } catch (error) {
      if (error instanceof TodoHookError) {
        throw error;
      }
      throw new TodoHookError(`Failed to add todo: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const toggleTodo = (id: string) => {
    try {
      if (!id || typeof id !== 'string') {
        throw new TodoHookError('Todo ID must be a non-empty string');
      }

      const todoExists = state.todos.some(todo => todo.id === id);
      if (!todoExists) {
        throw new TodoHookError(`Todo with ID "${id}" not found`);
      }

      dispatch({
        type: 'TOGGLE_TODO',
        payload: { id }
      });
    } catch (error) {
      if (error instanceof TodoHookError) {
        throw error;
      }
      throw new TodoHookError(`Failed to toggle todo: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const updateTodo = (id: string, title: string) => {
    try {
      if (!id || typeof id !== 'string') {
        throw new TodoHookError('Todo ID must be a non-empty string');
      }

      if (!title || typeof title !== 'string') {
        throw new TodoHookError('Title must be a non-empty string');
      }

      if (title.trim().length === 0) {
        throw new TodoHookError('Title cannot be empty or only whitespace');
      }

      if (title.length > 200) {
        throw new TodoHookError('Title cannot exceed 200 characters');
      }

      const todoExists = state.todos.some(todo => todo.id === id);
      if (!todoExists) {
        throw new TodoHookError(`Todo with ID "${id}" not found`);
      }

      dispatch({
        type: 'UPDATE_TODO',
        payload: { id, title }
      });
    } catch (error) {
      if (error instanceof TodoHookError) {
        throw error;
      }
      throw new TodoHookError(`Failed to update todo: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const deleteTodo = (id: string) => {
    try {
      if (!id || typeof id !== 'string') {
        throw new TodoHookError('Todo ID must be a non-empty string');
      }

      const todoExists = state.todos.some(todo => todo.id === id);
      if (!todoExists) {
        throw new TodoHookError(`Todo with ID "${id}" not found`);
      }

      dispatch({
        type: 'DELETE_TODO',
        payload: { id }
      });
    } catch (error) {
      if (error instanceof TodoHookError) {
        throw error;
      }
      throw new TodoHookError(`Failed to delete todo: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const setFilter = (filter: FilterType) => {
    try {
      if (!filter || typeof filter !== 'string') {
        throw new TodoHookError('Filter must be a non-empty string');
      }

      if (!['all', 'active', 'completed'].includes(filter)) {
        throw new TodoHookError('Filter must be one of: all, active, completed');
      }

      dispatch({
        type: 'SET_FILTER',
        payload: { filter }
      });
    } catch (error) {
      if (error instanceof TodoHookError) {
        throw error;
      }
      throw new TodoHookError(`Failed to set filter: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const loadTodos = (todos: Todo[]) => {
    try {
      if (!Array.isArray(todos)) {
        throw new TodoHookError('Todos must be an array');
      }

      // Validate each todo item
      todos.forEach((todo, index) => {
        if (!todo || typeof todo !== 'object') {
          throw new TodoHookError(`Invalid todo at index ${index}: must be an object`);
        }

        if (!todo.id || typeof todo.id !== 'string') {
          throw new TodoHookError(`Invalid todo at index ${index}: id must be a non-empty string`);
        }

        if (!todo.title || typeof todo.title !== 'string') {
          throw new TodoHookError(`Invalid todo at index ${index}: title must be a non-empty string`);
        }

        if (typeof todo.completed !== 'boolean') {
          throw new TodoHookError(`Invalid todo at index ${index}: completed must be a boolean`);
        }

        if (!(todo.createdAt instanceof Date) || isNaN(todo.createdAt.getTime())) {
          throw new TodoHookError(`Invalid todo at index ${index}: createdAt must be a valid Date`);
        }

        if (!(todo.updatedAt instanceof Date) || isNaN(todo.updatedAt.getTime())) {
          throw new TodoHookError(`Invalid todo at index ${index}: updatedAt must be a valid Date`);
        }
      });

      dispatch({
        type: 'LOAD_TODOS',
        payload: { todos }
      });
    } catch (error) {
      if (error instanceof TodoHookError) {
        throw error;
      }
      throw new TodoHookError(`Failed to load todos: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Utility functions
  const getTodoById = (id: string): Todo | undefined => {
    return state.todos.find(todo => todo.id === id);
  };

  const clearCompleted = () => {
    try {
      const completedTodos = state.todos.filter(todo => todo.completed);
      completedTodos.forEach(todo => {
        dispatch({
          type: 'DELETE_TODO',
          payload: { id: todo.id }
        });
      });
    } catch (error) {
      throw new TodoHookError(`Failed to clear completed todos: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const toggleAll = () => {
    try {
      const allCompleted = state.todos.length > 0 && state.todos.every(todo => todo.completed);
      
      state.todos.forEach(todo => {
        if (todo.completed === allCompleted) {
          dispatch({
            type: 'TOGGLE_TODO',
            payload: { id: todo.id }
          });
        }
      });
    } catch (error) {
      throw new TodoHookError(`Failed to toggle all todos: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return {
    // State
    todos: state.todos,
    filteredTodos,
    filter: state.filter,
    stats,

    // Actions
    addTodo,
    toggleTodo,
    updateTodo,
    deleteTodo,
    setFilter,
    loadTodos,

    // Utilities
    getTodoById,
    clearCompleted,
    toggleAll
  };
}