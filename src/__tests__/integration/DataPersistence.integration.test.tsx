import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoApp } from '../../components/TodoApp';
import { saveTodoState, loadTodoState } from '../../utils/storage';
import { Todo, TodoState } from '../../types/todo';

// Mock localStorage for testing
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('Data Persistence Integration Tests', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
  });

  describe('State Persistence Across Sessions', () => {
    it('should persist complete application state', async () => {
      const user = userEvent.setup();
      
      // First session - create todos and set filter
      const { unmount } = render(<TodoApp />);

      // Add multiple todos
      const input = screen.getByPlaceholderText('輸入新的待辦事項...');
      const addButton = screen.getByText('新增');

      await user.type(input, '第一個任務');
      await user.click(addButton);

      await user.type(input, '第二個任務');
      await user.click(addButton);

      await user.type(input, '第三個任務');
      await user.click(addButton);

      // Complete some todos
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[0]); // Complete first todo
      await user.click(checkboxes[2]); // Complete third todo

      // Set filter to completed
      const completedFilter = screen.getByText('已完成 (2)');
      await user.click(completedFilter);

      // Verify current state
      expect(screen.getByText('第一個任務')).toBeInTheDocument();
      expect(screen.getByText('第三個任務')).toBeInTheDocument();
      expect(screen.queryByText('第二個任務')).not.toBeInTheDocument();

      // End first session
      unmount();

      // Second session - verify state restoration
      render(<TodoApp />);

      // Should restore filter state (completed filter active)
      expect(screen.getByText('第一個任務')).toBeInTheDocument();
      expect(screen.getByText('第三個任務')).toBeInTheDocument();
      expect(screen.queryByText('第二個任務')).not.toBeInTheDocument();

      // Verify statistics are correct
      expect(screen.getByText('總計: 3')).toBeInTheDocument();
      expect(screen.getByText('已完成: 2')).toBeInTheDocument();
      expect(screen.getByText('未完成: 1')).toBeInTheDocument();

      // Switch to all filter to verify all todos exist
      const allFilter = screen.getByText('全部 (3)');
      await user.click(allFilter);

      expect(screen.getByText('第一個任務')).toBeInTheDocument();
      expect(screen.getByText('第二個任務')).toBeInTheDocument();
      expect(screen.getByText('第三個任務')).toBeInTheDocument();
    });

    it('should handle storage quota exceeded gracefully', async () => {
      const user = userEvent.setup();
      
      // Mock localStorage.setItem to throw QuotaExceededError
      const originalSetItem = mockLocalStorage.setItem;
      mockLocalStorage.setItem = jest.fn().mockImplementation(() => {
        const error = new DOMException('Storage quota exceeded', 'QuotaExceededError');
        error.name = 'QuotaExceededError';
        throw error;
      });

      render(<TodoApp />);

      // Try to add a todo (this should trigger save)
      const input = screen.getByPlaceholderText('輸入新的待辦事項...');
      const addButton = screen.getByText('新增');

      await user.type(input, '測試任務');
      await user.click(addButton);

      // Todo should still be added to the UI (in memory)
      expect(screen.getByText('測試任務')).toBeInTheDocument();

      // Restore original setItem
      mockLocalStorage.setItem = originalSetItem;
    });

    it('should handle corrupted data and reset gracefully', () => {
      // Set various types of corrupted data
      const corruptedDataCases = [
        'invalid json',
        '{"todos": "not an array"}',
        '{"todos": [{"id": 123}]}', // invalid todo structure
        '{"filter": "invalid_filter"}',
        null,
        undefined,
      ];

      corruptedDataCases.forEach((corruptedData, index) => {
        mockLocalStorage.clear();
        
        if (corruptedData !== null && corruptedData !== undefined) {
          mockLocalStorage.setItem('todoState', corruptedData);
        }

        // Should render without crashing
        const { unmount } = render(<TodoApp />);
        
        // Should show empty state
        expect(screen.getByText('沒有待辦事項')).toBeInTheDocument();
        expect(screen.getByText('總計: 0')).toBeInTheDocument();
        
        unmount();
      });
    });
  });

  describe('Real-time Data Synchronization', () => {
    it('should save data immediately after each operation', async () => {
      const user = userEvent.setup();
      render(<TodoApp />);

      const input = screen.getByPlaceholderText('輸入新的待辦事項...');
      const addButton = screen.getByText('新增');

      // Add todo and verify immediate save
      await user.type(input, '即時保存測試');
      await user.click(addButton);

      let savedData = JSON.parse(mockLocalStorage.getItem('todoState')!);
      expect(savedData.todos).toHaveLength(1);
      expect(savedData.todos[0].title).toBe('即時保存測試');
      expect(savedData.todos[0].completed).toBe(false);

      // Toggle completion and verify immediate save
      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      savedData = JSON.parse(mockLocalStorage.getItem('todoState')!);
      expect(savedData.todos[0].completed).toBe(true);

      // Edit todo and verify immediate save
      const todoTitle = screen.getByText('即時保存測試');
      await user.dblClick(todoTitle);

      const editInput = screen.getByDisplayValue('即時保存測試');
      await user.clear(editInput);
      await user.type(editInput, '編輯後的標題');
      
      const confirmButton = screen.getByText('✓');
      await user.click(confirmButton);

      savedData = JSON.parse(mockLocalStorage.getItem('todoState')!);
      expect(savedData.todos[0].title).toBe('編輯後的標題');

      // Change filter and verify immediate save
      const activeFilter = screen.getByText('未完成 (0)');
      await user.click(activeFilter);

      savedData = JSON.parse(mockLocalStorage.getItem('todoState')!);
      expect(savedData.filter).toBe('active');
    });

    it('should handle rapid successive operations correctly', async () => {
      const user = userEvent.setup();
      render(<TodoApp />);

      const input = screen.getByPlaceholderText('輸入新的待辦事項...');
      const addButton = screen.getByText('新增');

      // Rapidly add multiple todos
      const todoTitles = ['任務1', '任務2', '任務3', '任務4', '任務5'];
      
      for (const title of todoTitles) {
        await user.type(input, title);
        await user.click(addButton);
      }

      // Verify all todos were saved
      const savedData = JSON.parse(mockLocalStorage.getItem('todoState')!);
      expect(savedData.todos).toHaveLength(5);
      
      todoTitles.forEach((title, index) => {
        expect(savedData.todos[index].title).toBe(title);
      });

      // Rapidly toggle multiple todos
      const checkboxes = screen.getAllByRole('checkbox');
      for (let i = 0; i < 3; i++) {
        await user.click(checkboxes[i]);
      }

      // Verify completion states were saved
      const updatedData = JSON.parse(mockLocalStorage.getItem('todoState')!);
      expect(updatedData.todos.slice(0, 3).every((todo: Todo) => todo.completed)).toBe(true);
      expect(updatedData.todos.slice(3).every((todo: Todo) => !todo.completed)).toBe(true);
    });
  });

  describe('Data Migration and Compatibility', () => {
    it('should handle missing filter property in saved data', () => {
      // Simulate old data format without filter property
      const oldData = {
        todos: [
          {
            id: '1',
            title: '舊格式任務',
            completed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
      };

      mockLocalStorage.setItem('todoState', JSON.stringify(oldData));

      render(<TodoApp />);

      // Should load todos and default to 'all' filter
      expect(screen.getByText('舊格式任務')).toBeInTheDocument();
      expect(screen.getByText('全部 (1)')).toBeInTheDocument();
    });

    it('should handle todos with missing timestamps', () => {
      // Simulate data with missing timestamps
      const dataWithMissingTimestamps = {
        todos: [
          {
            id: '1',
            title: '缺少時間戳的任務',
            completed: false,
            // Missing createdAt and updatedAt
          },
        ],
        filter: 'all',
      };

      mockLocalStorage.setItem('todoState', JSON.stringify(dataWithMissingTimestamps));

      render(<TodoApp />);

      // Should still display the todo
      expect(screen.getByText('缺少時間戳的任務')).toBeInTheDocument();
    });

    it('should validate and clean invalid todo data', () => {
      // Simulate data with various invalid todos
      const dataWithInvalidTodos = {
        todos: [
          {
            id: '1',
            title: '有效任務',
            completed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            // Missing required fields
            id: '2',
            completed: true,
          },
          {
            id: '3',
            title: '', // Empty title
            completed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          null, // Null todo
          undefined, // Undefined todo
          'invalid', // String instead of object
        ],
        filter: 'all',
      };

      mockLocalStorage.setItem('todoState', JSON.stringify(dataWithInvalidTodos));

      render(<TodoApp />);

      // Should only display valid todos
      expect(screen.getByText('有效任務')).toBeInTheDocument();
      expect(screen.getByText('總計: 1')).toBeInTheDocument();
    });
  });

  describe('Storage Error Handling', () => {
    it('should handle localStorage unavailable scenario', () => {
      // Mock localStorage to be unavailable
      const originalLocalStorage = window.localStorage;
      Object.defineProperty(window, 'localStorage', {
        value: undefined,
        configurable: true,
      });

      // Should render without crashing
      render(<TodoApp />);
      expect(screen.getByText('沒有待辦事項')).toBeInTheDocument();

      // Restore localStorage
      Object.defineProperty(window, 'localStorage', {
        value: originalLocalStorage,
        configurable: true,
      });
    });

    it('should handle localStorage access denied', () => {
      // Mock localStorage methods to throw SecurityError
      const originalGetItem = mockLocalStorage.getItem;
      const originalSetItem = mockLocalStorage.setItem;

      mockLocalStorage.getItem = jest.fn().mockImplementation(() => {
        throw new DOMException('Access denied', 'SecurityError');
      });

      mockLocalStorage.setItem = jest.fn().mockImplementation(() => {
        throw new DOMException('Access denied', 'SecurityError');
      });

      // Should render without crashing
      render(<TodoApp />);
      expect(screen.getByText('沒有待辦事項')).toBeInTheDocument();

      // Restore original methods
      mockLocalStorage.getItem = originalGetItem;
      mockLocalStorage.setItem = originalSetItem;
    });
  });

  describe('Performance with Large Datasets', () => {
    it('should handle large number of todos efficiently', async () => {
      const user = userEvent.setup();
      
      // Create a large dataset
      const largeTodoState: TodoState = {
        todos: Array.from({ length: 1000 }, (_, i) => ({
          id: `todo-${i}`,
          title: `任務 ${i + 1}`,
          completed: i % 3 === 0, // Every third todo is completed
          createdAt: new Date(Date.now() - i * 1000),
          updatedAt: new Date(Date.now() - i * 1000),
        })),
        filter: 'all',
      };

      mockLocalStorage.setItem('todoState', JSON.stringify(largeTodoState));

      const startTime = performance.now();
      render(<TodoApp />);
      const renderTime = performance.now() - startTime;

      // Should render within reasonable time (less than 1 second)
      expect(renderTime).toBeLessThan(1000);

      // Should display correct statistics
      expect(screen.getByText('總計: 1000')).toBeInTheDocument();
      expect(screen.getByText('已完成: 334')).toBeInTheDocument(); // 1000/3 rounded up
      expect(screen.getByText('未完成: 666')).toBeInTheDocument();

      // Should handle filtering efficiently
      const activeFilter = screen.getByText('未完成 (666)');
      const filterStartTime = performance.now();
      await user.click(activeFilter);
      const filterTime = performance.now() - filterStartTime;

      expect(filterTime).toBeLessThan(500); // Should filter within 500ms
    });
  });
});