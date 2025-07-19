import { renderHook, act } from '@testing-library/react';
import { ReactNode } from 'react';
import { useTodos, TodoHookError } from '../useTodos';
import { TodoProvider } from '../../context/TodoContext';
import { Todo } from '../../types/todo';

// Mock storage functions to avoid localStorage issues in tests
jest.mock('../../utils/storage', () => ({
  saveTodoState: jest.fn(),
  loadTodoState: jest.fn(() => ({ todos: [], filter: 'all' })),
  StorageError: class StorageError extends Error {}
}));

// Test wrapper component
const TestWrapper = ({ children }: { children: ReactNode }) => (
  <TodoProvider>{children}</TodoProvider>
);

describe('useTodos', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Hook initialization', () => {
    it('should throw error when used outside TodoProvider', () => {
      // Test that the hook throws an error when used outside provider
      expect(() => {
        renderHook(() => useTodos());
      }).toThrow('useTodos must be used within a TodoProvider');
    });

    it('should initialize with empty state', () => {
      const { result } = renderHook(() => useTodos(), {
        wrapper: TestWrapper
      });

      expect(result.current.todos).toEqual([]);
      expect(result.current.filteredTodos).toEqual([]);
      expect(result.current.filter).toBe('all');
      expect(result.current.stats).toEqual({
        total: 0,
        completed: 0,
        active: 0,
        completionPercentage: 0
      });
    });
  });

  describe('addTodo', () => {
    it('should add a new todo', () => {
      const { result } = renderHook(() => useTodos(), {
        wrapper: TestWrapper
      });

      act(() => {
        result.current.addTodo('New Todo');
      });

      expect(result.current.todos).toHaveLength(1);
      expect(result.current.todos[0].title).toBe('New Todo');
      expect(result.current.todos[0].completed).toBe(false);
    });

    it('should throw error for empty title', () => {
      const { result } = renderHook(() => useTodos(), {
        wrapper: TestWrapper
      });

      expect(() => {
        act(() => {
          result.current.addTodo('');
        });
      }).toThrow(TodoHookError);
    });

    it('should throw error for whitespace-only title', () => {
      const { result } = renderHook(() => useTodos(), {
        wrapper: TestWrapper
      });

      expect(() => {
        act(() => {
          result.current.addTodo('   ');
        });
      }).toThrow(TodoHookError);
    });

    it('should throw error for non-string title', () => {
      const { result } = renderHook(() => useTodos(), {
        wrapper: TestWrapper
      });

      expect(() => {
        act(() => {
          result.current.addTodo(null as any);
        });
      }).toThrow(TodoHookError);
    });

    it('should throw error for title exceeding 200 characters', () => {
      const { result } = renderHook(() => useTodos(), {
        wrapper: TestWrapper
      });

      const longTitle = 'a'.repeat(201);

      expect(() => {
        act(() => {
          result.current.addTodo(longTitle);
        });
      }).toThrow(TodoHookError);
    });
  });

  describe('toggleTodo', () => {
    it('should toggle todo completion status', () => {
      const { result } = renderHook(() => useTodos(), {
        wrapper: TestWrapper
      });

      // Add a todo first
      act(() => {
        result.current.addTodo('Test Todo');
      });

      const todoId = result.current.todos[0].id;

      // Toggle it
      act(() => {
        result.current.toggleTodo(todoId);
      });

      expect(result.current.todos[0].completed).toBe(true);
    });

    it('should throw error for invalid id', () => {
      const { result } = renderHook(() => useTodos(), {
        wrapper: TestWrapper
      });

      expect(() => {
        act(() => {
          result.current.toggleTodo('');
        });
      }).toThrow(TodoHookError);
    });

    it('should throw error for non-existent todo', () => {
      const { result } = renderHook(() => useTodos(), {
        wrapper: TestWrapper
      });

      expect(() => {
        act(() => {
          result.current.toggleTodo('non-existent-id');
        });
      }).toThrow(TodoHookError);
    });
  });

  describe('updateTodo', () => {
    it('should update todo title', () => {
      const { result } = renderHook(() => useTodos(), {
        wrapper: TestWrapper
      });

      // Add a todo first
      act(() => {
        result.current.addTodo('Original Title');
      });

      const todoId = result.current.todos[0].id;

      // Update it
      act(() => {
        result.current.updateTodo(todoId, 'Updated Title');
      });

      expect(result.current.todos[0].title).toBe('Updated Title');
    });

    it('should throw error for invalid id', () => {
      const { result } = renderHook(() => useTodos(), {
        wrapper: TestWrapper
      });

      expect(() => {
        act(() => {
          result.current.updateTodo('', 'New Title');
        });
      }).toThrow(TodoHookError);
    });

    it('should throw error for empty title', () => {
      const { result } = renderHook(() => useTodos(), {
        wrapper: TestWrapper
      });

      // Add a todo first
      act(() => {
        result.current.addTodo('Test Todo');
      });

      const todoId = result.current.todos[0].id;

      expect(() => {
        act(() => {
          result.current.updateTodo(todoId, '');
        });
      }).toThrow(TodoHookError);
    });

    it('should throw error for non-existent todo', () => {
      const { result } = renderHook(() => useTodos(), {
        wrapper: TestWrapper
      });

      expect(() => {
        act(() => {
          result.current.updateTodo('non-existent-id', 'New Title');
        });
      }).toThrow(TodoHookError);
    });
  });

  describe('deleteTodo', () => {
    it('should delete todo', () => {
      const { result } = renderHook(() => useTodos(), {
        wrapper: TestWrapper
      });

      // Add a todo first
      act(() => {
        result.current.addTodo('Test Todo');
      });

      expect(result.current.todos).toHaveLength(1);
      const todoId = result.current.todos[0].id;

      // Delete it
      act(() => {
        result.current.deleteTodo(todoId);
      });

      expect(result.current.todos).toHaveLength(0);
    });

    it('should throw error for invalid id', () => {
      const { result } = renderHook(() => useTodos(), {
        wrapper: TestWrapper
      });

      expect(() => {
        act(() => {
          result.current.deleteTodo('');
        });
      }).toThrow(TodoHookError);
    });

    it('should throw error for non-existent todo', () => {
      const { result } = renderHook(() => useTodos(), {
        wrapper: TestWrapper
      });

      expect(() => {
        act(() => {
          result.current.deleteTodo('non-existent-id');
        });
      }).toThrow(TodoHookError);
    });
  });

  describe('setFilter', () => {
    it('should set filter to all', () => {
      const { result } = renderHook(() => useTodos(), {
        wrapper: TestWrapper
      });

      act(() => {
        result.current.setFilter('all');
      });

      expect(result.current.filter).toBe('all');
    });

    it('should set filter to active', () => {
      const { result } = renderHook(() => useTodos(), {
        wrapper: TestWrapper
      });

      act(() => {
        result.current.setFilter('active');
      });

      expect(result.current.filter).toBe('active');
    });

    it('should set filter to completed', () => {
      const { result } = renderHook(() => useTodos(), {
        wrapper: TestWrapper
      });

      act(() => {
        result.current.setFilter('completed');
      });

      expect(result.current.filter).toBe('completed');
    });

    it('should throw error for invalid filter', () => {
      const { result } = renderHook(() => useTodos(), {
        wrapper: TestWrapper
      });

      expect(() => {
        act(() => {
          result.current.setFilter('invalid' as any);
        });
      }).toThrow(TodoHookError);
    });
  });

  describe('filteredTodos', () => {
    beforeEach(() => {
      // This will run before each test in this describe block
    });

    it('should filter active todos', () => {
      const { result } = renderHook(() => useTodos(), {
        wrapper: TestWrapper
      });

      // Add todos
      act(() => {
        result.current.addTodo('Active Todo');
        result.current.addTodo('Completed Todo');
      });

      // Complete one todo
      act(() => {
        result.current.toggleTodo(result.current.todos[1].id);
      });

      // Set filter to active
      act(() => {
        result.current.setFilter('active');
      });

      expect(result.current.filteredTodos).toHaveLength(1);
      expect(result.current.filteredTodos[0].title).toBe('Active Todo');
    });

    it('should filter completed todos', () => {
      const { result } = renderHook(() => useTodos(), {
        wrapper: TestWrapper
      });

      // Add todos
      act(() => {
        result.current.addTodo('Active Todo');
        result.current.addTodo('Completed Todo');
      });

      // Complete one todo
      act(() => {
        result.current.toggleTodo(result.current.todos[1].id);
      });

      // Set filter to completed
      act(() => {
        result.current.setFilter('completed');
      });

      expect(result.current.filteredTodos).toHaveLength(1);
      expect(result.current.filteredTodos[0].title).toBe('Completed Todo');
    });

    it('should show all todos when filter is all', () => {
      const { result } = renderHook(() => useTodos(), {
        wrapper: TestWrapper
      });

      // Add todos
      act(() => {
        result.current.addTodo('Active Todo');
        result.current.addTodo('Completed Todo');
      });

      // Complete one todo
      act(() => {
        result.current.toggleTodo(result.current.todos[1].id);
      });

      // Set filter to all
      act(() => {
        result.current.setFilter('all');
      });

      expect(result.current.filteredTodos).toHaveLength(2);
    });
  });

  describe('stats', () => {
    it('should calculate stats correctly', () => {
      const { result } = renderHook(() => useTodos(), {
        wrapper: TestWrapper
      });

      // Add todos
      act(() => {
        result.current.addTodo('Todo 1');
        result.current.addTodo('Todo 2');
        result.current.addTodo('Todo 3');
      });

      // Complete one todo
      act(() => {
        result.current.toggleTodo(result.current.todos[0].id);
      });

      expect(result.current.stats).toEqual({
        total: 3,
        completed: 1,
        active: 2,
        completionPercentage: 33
      });
    });

    it('should handle empty todos', () => {
      const { result } = renderHook(() => useTodos(), {
        wrapper: TestWrapper
      });

      expect(result.current.stats).toEqual({
        total: 0,
        completed: 0,
        active: 0,
        completionPercentage: 0
      });
    });
  });

  describe('utility functions', () => {
    describe('getTodoById', () => {
      it('should return todo by id', () => {
        const { result } = renderHook(() => useTodos(), {
          wrapper: TestWrapper
        });

        act(() => {
          result.current.addTodo('Test Todo');
        });

        const todoId = result.current.todos[0].id;
        const foundTodo = result.current.getTodoById(todoId);

        expect(foundTodo).toBeDefined();
        expect(foundTodo?.title).toBe('Test Todo');
      });

      it('should return undefined for non-existent id', () => {
        const { result } = renderHook(() => useTodos(), {
          wrapper: TestWrapper
        });

        const foundTodo = result.current.getTodoById('non-existent');

        expect(foundTodo).toBeUndefined();
      });
    });

    describe('clearCompleted', () => {
      it('should clear all completed todos', () => {
        const { result } = renderHook(() => useTodos(), {
          wrapper: TestWrapper
        });

        // Add todos
        act(() => {
          result.current.addTodo('Active Todo');
          result.current.addTodo('Completed Todo 1');
          result.current.addTodo('Completed Todo 2');
        });

        // Complete two todos
        act(() => {
          result.current.toggleTodo(result.current.todos[1].id);
          result.current.toggleTodo(result.current.todos[2].id);
        });

        expect(result.current.todos).toHaveLength(3);

        // Clear completed
        act(() => {
          result.current.clearCompleted();
        });

        expect(result.current.todos).toHaveLength(1);
        expect(result.current.todos[0].title).toBe('Active Todo');
      });
    });

    describe('toggleAll', () => {
      it('should mark all todos as completed when some are incomplete', () => {
        const { result } = renderHook(() => useTodos(), {
          wrapper: TestWrapper
        });

        // Add todos
        act(() => {
          result.current.addTodo('Todo 1');
          result.current.addTodo('Todo 2');
          result.current.addTodo('Todo 3');
        });

        // Complete one todo
        act(() => {
          result.current.toggleTodo(result.current.todos[0].id);
        });

        // Toggle all
        act(() => {
          result.current.toggleAll();
        });

        expect(result.current.todos.every(todo => todo.completed)).toBe(true);
      });

      it('should mark all todos as incomplete when all are completed', () => {
        const { result } = renderHook(() => useTodos(), {
          wrapper: TestWrapper
        });

        // Add todos
        act(() => {
          result.current.addTodo('Todo 1');
          result.current.addTodo('Todo 2');
        });

        // Complete all todos
        act(() => {
          result.current.toggleTodo(result.current.todos[0].id);
          result.current.toggleTodo(result.current.todos[1].id);
        });

        expect(result.current.todos.every(todo => todo.completed)).toBe(true);

        // Toggle all
        act(() => {
          result.current.toggleAll();
        });

        expect(result.current.todos.every(todo => !todo.completed)).toBe(true);
      });
    });
  });

  describe('loadTodos', () => {
    it('should load valid todos', () => {
      const { result } = renderHook(() => useTodos(), {
        wrapper: TestWrapper
      });

      const todosToLoad: Todo[] = [
        {
          id: 'test-1',
          title: 'Test Todo 1',
          completed: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'test-2',
          title: 'Test Todo 2',
          completed: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      act(() => {
        result.current.loadTodos(todosToLoad);
      });

      expect(result.current.todos).toEqual(todosToLoad);
    });

    it('should throw error for non-array input', () => {
      const { result } = renderHook(() => useTodos(), {
        wrapper: TestWrapper
      });

      expect(() => {
        act(() => {
          result.current.loadTodos('not an array' as any);
        });
      }).toThrow(TodoHookError);
    });

    it('should throw error for invalid todo objects', () => {
      const { result } = renderHook(() => useTodos(), {
        wrapper: TestWrapper
      });

      const invalidTodos = [
        {
          id: 'test-1',
          // missing title
          completed: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      expect(() => {
        act(() => {
          result.current.loadTodos(invalidTodos as any);
        });
      }).toThrow(TodoHookError);
    });
  });
});