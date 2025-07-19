import { todoReducer } from '../TodoContext';
import { TodoState, TodoAction } from '../../types/todo';

describe('todoReducer', () => {
  const initialState: TodoState = {
    todos: [],
    filter: 'all'
  };

  const mockTodo = {
    id: 'test-id',
    title: 'Test Todo',
    completed: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  };

  const stateWithTodo: TodoState = {
    todos: [mockTodo],
    filter: 'all'
  };

  describe('ADD_TODO', () => {
    it('should add a new todo with valid title', () => {
      const action: TodoAction = {
        type: 'ADD_TODO',
        payload: { title: 'New Todo' }
      };

      const result = todoReducer(initialState, action);

      expect(result.todos).toHaveLength(1);
      expect(result.todos[0].title).toBe('New Todo');
      expect(result.todos[0].completed).toBe(false);
      expect(result.todos[0].id).toBeDefined();
      expect(result.todos[0].createdAt).toBeInstanceOf(Date);
      expect(result.todos[0].updatedAt).toBeInstanceOf(Date);
    });

    it('should trim whitespace from title', () => {
      const action: TodoAction = {
        type: 'ADD_TODO',
        payload: { title: '  Trimmed Todo  ' }
      };

      const result = todoReducer(initialState, action);

      expect(result.todos[0].title).toBe('Trimmed Todo');
    });

    it('should not add todo with empty title', () => {
      const action: TodoAction = {
        type: 'ADD_TODO',
        payload: { title: '' }
      };

      const result = todoReducer(initialState, action);

      expect(result.todos).toHaveLength(0);
      expect(result).toBe(initialState);
    });

    it('should not add todo with only whitespace', () => {
      const action: TodoAction = {
        type: 'ADD_TODO',
        payload: { title: '   ' }
      };

      const result = todoReducer(initialState, action);

      expect(result.todos).toHaveLength(0);
      expect(result).toBe(initialState);
    });
  });

  describe('TOGGLE_TODO', () => {
    it('should toggle todo completion status', () => {
      const action: TodoAction = {
        type: 'TOGGLE_TODO',
        payload: { id: 'test-id' }
      };

      const result = todoReducer(stateWithTodo, action);

      expect(result.todos[0].completed).toBe(true);
      expect(result.todos[0].updatedAt).not.toEqual(mockTodo.updatedAt);
    });

    it('should toggle completed todo back to incomplete', () => {
      const completedTodo = { ...mockTodo, completed: true };
      const stateWithCompletedTodo: TodoState = {
        todos: [completedTodo],
        filter: 'all'
      };

      const action: TodoAction = {
        type: 'TOGGLE_TODO',
        payload: { id: 'test-id' }
      };

      const result = todoReducer(stateWithCompletedTodo, action);

      expect(result.todos[0].completed).toBe(false);
    });

    it('should not affect other todos', () => {
      const secondTodo = {
        id: 'test-id-2',
        title: 'Second Todo',
        completed: false,
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02')
      };

      const stateWithMultipleTodos: TodoState = {
        todos: [mockTodo, secondTodo],
        filter: 'all'
      };

      const action: TodoAction = {
        type: 'TOGGLE_TODO',
        payload: { id: 'test-id' }
      };

      const result = todoReducer(stateWithMultipleTodos, action);

      expect(result.todos[0].completed).toBe(true);
      expect(result.todos[1].completed).toBe(false);
      expect(result.todos[1]).toEqual(secondTodo);
    });

    it('should handle non-existent todo id gracefully', () => {
      const action: TodoAction = {
        type: 'TOGGLE_TODO',
        payload: { id: 'non-existent' }
      };

      const result = todoReducer(stateWithTodo, action);

      expect(result.todos[0]).toEqual(mockTodo);
    });
  });

  describe('UPDATE_TODO', () => {
    it('should update todo title', () => {
      const action: TodoAction = {
        type: 'UPDATE_TODO',
        payload: { id: 'test-id', title: 'Updated Todo' }
      };

      const result = todoReducer(stateWithTodo, action);

      expect(result.todos[0].title).toBe('Updated Todo');
      expect(result.todos[0].updatedAt).not.toEqual(mockTodo.updatedAt);
    });

    it('should trim whitespace from updated title', () => {
      const action: TodoAction = {
        type: 'UPDATE_TODO',
        payload: { id: 'test-id', title: '  Updated Todo  ' }
      };

      const result = todoReducer(stateWithTodo, action);

      expect(result.todos[0].title).toBe('Updated Todo');
    });

    it('should not update with empty title', () => {
      const action: TodoAction = {
        type: 'UPDATE_TODO',
        payload: { id: 'test-id', title: '' }
      };

      const result = todoReducer(stateWithTodo, action);

      expect(result.todos[0].title).toBe('Test Todo');
      expect(result).toBe(stateWithTodo);
    });

    it('should not update with only whitespace', () => {
      const action: TodoAction = {
        type: 'UPDATE_TODO',
        payload: { id: 'test-id', title: '   ' }
      };

      const result = todoReducer(stateWithTodo, action);

      expect(result.todos[0].title).toBe('Test Todo');
      expect(result).toBe(stateWithTodo);
    });

    it('should handle non-existent todo id gracefully', () => {
      const action: TodoAction = {
        type: 'UPDATE_TODO',
        payload: { id: 'non-existent', title: 'Updated' }
      };

      const result = todoReducer(stateWithTodo, action);

      expect(result.todos[0]).toEqual(mockTodo);
    });
  });

  describe('DELETE_TODO', () => {
    it('should delete todo by id', () => {
      const action: TodoAction = {
        type: 'DELETE_TODO',
        payload: { id: 'test-id' }
      };

      const result = todoReducer(stateWithTodo, action);

      expect(result.todos).toHaveLength(0);
    });

    it('should only delete the specified todo', () => {
      const secondTodo = {
        id: 'test-id-2',
        title: 'Second Todo',
        completed: false,
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02')
      };

      const stateWithMultipleTodos: TodoState = {
        todos: [mockTodo, secondTodo],
        filter: 'all'
      };

      const action: TodoAction = {
        type: 'DELETE_TODO',
        payload: { id: 'test-id' }
      };

      const result = todoReducer(stateWithMultipleTodos, action);

      expect(result.todos).toHaveLength(1);
      expect(result.todos[0]).toEqual(secondTodo);
    });

    it('should handle non-existent todo id gracefully', () => {
      const action: TodoAction = {
        type: 'DELETE_TODO',
        payload: { id: 'non-existent' }
      };

      const result = todoReducer(stateWithTodo, action);

      expect(result.todos).toHaveLength(1);
      expect(result.todos[0]).toEqual(mockTodo);
    });
  });

  describe('SET_FILTER', () => {
    it('should set filter to all', () => {
      const action: TodoAction = {
        type: 'SET_FILTER',
        payload: { filter: 'all' }
      };

      const result = todoReducer(initialState, action);

      expect(result.filter).toBe('all');
    });

    it('should set filter to active', () => {
      const action: TodoAction = {
        type: 'SET_FILTER',
        payload: { filter: 'active' }
      };

      const result = todoReducer(initialState, action);

      expect(result.filter).toBe('active');
    });

    it('should set filter to completed', () => {
      const action: TodoAction = {
        type: 'SET_FILTER',
        payload: { filter: 'completed' }
      };

      const result = todoReducer(initialState, action);

      expect(result.filter).toBe('completed');
    });
  });

  describe('LOAD_TODOS', () => {
    it('should load todos from payload', () => {
      const todosToLoad = [
        mockTodo,
        {
          id: 'test-id-2',
          title: 'Second Todo',
          completed: true,
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02')
        }
      ];

      const action: TodoAction = {
        type: 'LOAD_TODOS',
        payload: { todos: todosToLoad }
      };

      const result = todoReducer(initialState, action);

      expect(result.todos).toEqual(todosToLoad);
      expect(result.filter).toBe('all'); // Should preserve existing filter
    });

    it('should replace existing todos', () => {
      const newTodos = [
        {
          id: 'new-id',
          title: 'New Todo',
          completed: false,
          createdAt: new Date('2024-01-03'),
          updatedAt: new Date('2024-01-03')
        }
      ];

      const action: TodoAction = {
        type: 'LOAD_TODOS',
        payload: { todos: newTodos }
      };

      const result = todoReducer(stateWithTodo, action);

      expect(result.todos).toEqual(newTodos);
      expect(result.todos).toHaveLength(1);
    });
  });

  describe('Unknown action', () => {
    it('should return current state for unknown action', () => {
      const unknownAction = { type: 'UNKNOWN_ACTION' } as any;

      const result = todoReducer(stateWithTodo, unknownAction);

      expect(result).toBe(stateWithTodo);
    });
  });
});