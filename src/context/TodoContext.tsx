import React, { createContext, useReducer, useEffect, ReactNode } from 'react';
import { Todo, TodoState, TodoAction } from '../types/todo';
import { saveTodoState, loadTodoState } from '../utils/storage';

/**
 * Generate unique ID for todos
 */
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Todo reducer function to handle all state changes
 */
export function todoReducer(state: TodoState, action: TodoAction): TodoState {
  switch (action.type) {
    case 'ADD_TODO': {
      const { title } = action.payload;
      
      if (!title.trim()) {
        return state; // Don't add empty todos
      }

      const newTodo: Todo = {
        id: generateId(),
        title: title.trim(),
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      return {
        ...state,
        todos: [...state.todos, newTodo]
      };
    }

    case 'TOGGLE_TODO': {
      const { id } = action.payload;
      
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === id
            ? { ...todo, completed: !todo.completed, updatedAt: new Date() }
            : todo
        )
      };
    }

    case 'UPDATE_TODO': {
      const { id, title } = action.payload;
      
      if (!title.trim()) {
        return state; // Don't update with empty title
      }

      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === id
            ? { ...todo, title: title.trim(), updatedAt: new Date() }
            : todo
        )
      };
    }

    case 'DELETE_TODO': {
      const { id } = action.payload;
      
      return {
        ...state,
        todos: state.todos.filter(todo => todo.id !== id)
      };
    }

    case 'SET_FILTER': {
      const { filter } = action.payload;
      
      return {
        ...state,
        filter
      };
    }

    case 'LOAD_TODOS': {
      const { todos } = action.payload;
      
      return {
        ...state,
        todos
      };
    }

    default:
      return state;
  }
}

/**
 * Context type definition
 */
export interface TodoContextType {
  state: TodoState;
  dispatch: React.Dispatch<TodoAction>;
}

/**
 * Create the TodoContext
 */
export const TodoContext = createContext<TodoContextType | null>(null);

/**
 * Props for TodoProvider
 */
interface TodoProviderProps {
  children: ReactNode;
  initialState?: TodoState;
}

/**
 * TodoProvider component that provides todo state and dispatch to children
 */
export function TodoProvider({ children, initialState }: TodoProviderProps) {
  // Initialize state with provided initial state or data from localStorage
  const [state, dispatch] = useReducer(todoReducer, initialState || loadTodoState());

  // Save state to localStorage whenever it changes
  useEffect(() => {
    try {
      saveTodoState(state);
    } catch (error) {
      console.error('Failed to save todo state:', error);
      // Could implement user notification here
    }
  }, [state]);

  const contextValue: TodoContextType = {
    state,
    dispatch
  };

  return (
    <TodoContext.Provider value={contextValue}>
      {children}
    </TodoContext.Provider>
  );
}