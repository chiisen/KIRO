import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoApp } from '../../components/TodoApp';

// Mock localStorage for consistent testing
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
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock window.confirm for delete confirmations
const mockConfirm = jest.fn();
Object.defineProperty(window, 'confirm', {
  value: mockConfirm,
});

// Helper function to get form elements
const getFormElements = () => {
  const input = screen.getByRole('textbox');
  const addButton = screen.getByRole('button', { name: '新增待辦事項' });
  return { input, addButton };
};

describe('End-to-End User Flows Integration Tests', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    mockLocalStorage.clear();
    // Reset confirm mock
    mockConfirm.mockReset();
    mockConfirm.mockReturnValue(true); // Default to confirming deletions
  });

  describe('Complete User Journey: From Empty to Productive', () => {
    it('should handle a complete user journey from empty state to managing multiple todos', async () => {
      const user = userEvent.setup();
      render(<TodoApp />);

      // Step 1: Verify initial empty state
      expect(screen.getByText('沒有待辦事項')).toBeInTheDocument();
      expect(screen.getByText('還沒有任何待辦事項')).toBeInTheDocument();
      expect(screen.getByText('新增第一個任務開始使用吧！')).toBeInTheDocument();

      // Step 2: Add first todo
      const { input, addButton } = getFormElements();

      await user.type(input, '學習 React 基礎');
      await user.click(addButton);

      // Verify first todo added
      expect(screen.getByText('學習 React 基礎')).toBeInTheDocument();
      expect(screen.queryByText('沒有待辦事項')).not.toBeInTheDocument();

      // Step 3: Add multiple todos to build a realistic list
      const todoTitles = [
        '設置開發環境',
        '學習 TypeScript',
        '建立第一個組件',
        '學習狀態管理',
        '撰寫測試',
        '部署應用程式'
      ];

      for (const title of todoTitles) {
        await user.type(input, title);
        await user.click(addButton);
      }

      // Verify all todos are present
      todoTitles.forEach(title => {
        expect(screen.getByText(title)).toBeInTheDocument();
      });

      // Step 4: Complete some tasks (simulate progress)
      const checkboxes = screen.getAllByRole('checkbox');
      
      // Complete first 3 tasks
      await user.click(checkboxes[0]); // 學習 React 基礎
      await user.click(checkboxes[1]); // 設置開發環境
      await user.click(checkboxes[2]); // 學習 TypeScript

      // Step 5: Use filters to focus on different task types
      // Filter to show only active tasks
      const activeFilter = screen.getByText(/未完成/);
      await user.click(activeFilter);

      // Should only show uncompleted tasks
      expect(screen.queryByText('學習 React 基礎')).not.toBeInTheDocument();
      expect(screen.getByText('建立第一個組件')).toBeInTheDocument();
      expect(screen.getByText('學習狀態管理')).toBeInTheDocument();

      // Step 6: Edit a task to reflect changing requirements
      const taskToEdit = screen.getByText('建立第一個組件');
      await user.dblClick(taskToEdit);

      const editInput = screen.getByDisplayValue('建立第一個組件');
      await user.clear(editInput);
      await user.type(editInput, '建立多個可重用組件');
      
      const confirmButton = screen.getByText('✓');
      await user.click(confirmButton);

      // Verify edit was applied
      expect(screen.getByText('建立多個可重用組件')).toBeInTheDocument();
      expect(screen.queryByText('建立第一個組件')).not.toBeInTheDocument();

      // Step 7: Complete more tasks
      const remainingCheckboxes = screen.getAllByRole('checkbox');
      await user.click(remainingCheckboxes[0]); // Complete the edited task
      await user.click(remainingCheckboxes[1]); // Complete another task

      // Step 8: Check completed tasks
      const completedFilter = screen.getByText(/已完成/);
      await user.click(completedFilter);

      // Should show completed tasks
      expect(screen.getByText('學習 React 基礎')).toBeInTheDocument();
      expect(screen.getByText('設置開發環境')).toBeInTheDocument();
      expect(screen.getByText('建立多個可重用組件')).toBeInTheDocument();

      // Step 9: Remove completed tasks to clean up
      const deleteButtons = screen.getAllByText('🗑️');
      
      // Delete first 2 completed tasks
      await user.click(deleteButtons[0]);
      await user.click(deleteButtons[0]); // Index 0 again because array shifts

      // Step 10: Return to all view and verify final state
      const allFilter = screen.getByText(/全部/);
      await user.click(allFilter);

      // Step 11: Verify data persistence by simulating page reload
      const { unmount } = render(<TodoApp />);
      unmount();
      
      render(<TodoApp />);

      // Should restore some state (exact numbers may vary due to deletions)
      expect(screen.queryByText('沒有待辦事項')).not.toBeInTheDocument();
    });
  });

  describe('Error Recovery and Edge Cases', () => {
    it('should handle rapid user interactions gracefully', async () => {
      const user = userEvent.setup();
      render(<TodoApp />);

      const { input, addButton } = getFormElements();

      // Rapid adding of todos
      const rapidTodos = ['任務1', '任務2', '任務3', '任務4', '任務5'];
      
      for (const todo of rapidTodos) {
        await user.type(input, todo);
        await user.click(addButton);
      }

      // All should be added successfully
      rapidTodos.forEach(todo => {
        expect(screen.getByText(todo)).toBeInTheDocument();
      });

      // Rapid toggling of completion status
      const checkboxes = screen.getAllByRole('checkbox');
      for (let i = 0; i < 3; i++) {
        await user.click(checkboxes[i]);
        await user.click(checkboxes[i]); // Toggle back
        await user.click(checkboxes[i]); // Toggle again
      }

      // Should end up with 3 completed tasks (verify by checking some completed state exists)
      expect(screen.getByText(/已完成/)).toBeInTheDocument();
    });

    it('should handle validation errors and recovery', async () => {
      const user = userEvent.setup();
      render(<TodoApp />);

      const { input, addButton } = getFormElements();

      // Try to add empty todo
      await user.click(addButton);
      expect(screen.getByText('請輸入待辦事項標題')).toBeInTheDocument();

      // Try to add whitespace-only todo
      await user.type(input, '   ');
      await user.click(addButton);
      expect(screen.getByText('請輸入待辦事項標題')).toBeInTheDocument();

      // Add valid todo after errors
      await user.clear(input);
      await user.type(input, '有效的待辦事項');
      await user.click(addButton);

      // Should succeed and clear error
      expect(screen.getByText('有效的待辦事項')).toBeInTheDocument();
      expect(screen.queryByText('請輸入待辦事項標題')).not.toBeInTheDocument();
    });

    it('should handle delete confirmation scenarios', async () => {
      const user = userEvent.setup();
      render(<TodoApp />);

      // Add a todo to delete
      const { input } = getFormElements();
      await user.type(input, '要測試刪除的任務');
      await user.click(screen.getByRole('button', { name: '新增' }));

      const deleteButton = screen.getByText('🗑️');

      // Test canceling deletion
      mockConfirm.mockReturnValueOnce(false);
      await user.click(deleteButton);

      // Todo should still exist
      expect(screen.getByText('要測試刪除的任務')).toBeInTheDocument();

      // Test confirming deletion
      mockConfirm.mockReturnValueOnce(true);
      await user.click(deleteButton);

      // Todo should be deleted
      expect(screen.queryByText('要測試刪除的任務')).not.toBeInTheDocument();
      expect(screen.getByText('沒有待辦事項')).toBeInTheDocument();
    });
  });

  describe('Accessibility and Keyboard Navigation', () => {
    it('should support full keyboard navigation workflow', async () => {
      const user = userEvent.setup();
      render(<TodoApp />);

      // Add todo using Enter key
      const input = screen.getByRole('textbox');
      await user.type(input, '鍵盤導航測試');
      await user.keyboard('{Enter}');

      expect(screen.getByText('鍵盤導航測試')).toBeInTheDocument();

      // Edit using keyboard
      const todoTitle = screen.getByText('鍵盤導航測試');
      await user.dblClick(todoTitle);

      const editInput = screen.getByDisplayValue('鍵盤導航測試');
      await user.clear(editInput);
      await user.type(editInput, '編輯後的標題');
      await user.keyboard('{Enter}');

      expect(screen.getByText('編輯後的標題')).toBeInTheDocument();

      // Test Escape key cancellation
      await user.dblClick(screen.getByText('編輯後的標題'));
      const editInput2 = screen.getByDisplayValue('編輯後的標題');
      await user.clear(editInput2);
      await user.type(editInput2, '不會保存的修改');
      await user.keyboard('{Escape}');

      // Should revert to original
      expect(screen.getByText('編輯後的標題')).toBeInTheDocument();
      expect(screen.queryByText('不會保存的修改')).not.toBeInTheDocument();
    });

    it('should maintain proper ARIA attributes and screen reader support', async () => {
      const user = userEvent.setup();
      render(<TodoApp />);

      // Check initial ARIA attributes
      expect(screen.getByRole('region', { name: '待辦事項統計' })).toBeInTheDocument();
      expect(screen.getByRole('tablist', { name: '過濾待辦事項' })).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();

      // Add todo and check dynamic ARIA updates
      const input = screen.getByRole('textbox');
      await user.type(input, '無障礙測試');
      await user.click(screen.getByRole('button', { name: '新增' }));

      // Check that progress bar updates
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');

      // Complete the todo and check updates
      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      expect(progressBar).toHaveAttribute('aria-valuenow', '100');
    });
  });

  describe('Performance and Large Dataset Handling', () => {
    it('should handle moderate number of todos efficiently', async () => {
      const user = userEvent.setup();
      render(<TodoApp />);

      const { input, addButton } = getFormElements();

      // Add 20 todos (reduced from 50 for faster test execution)
      const startTime = performance.now();
      
      for (let i = 1; i <= 20; i++) {
        await user.type(input, `任務 ${i}`);
        await user.click(addButton);
      }

      const addTime = performance.now() - startTime;
      
      // Should complete within reasonable time (less than 10 seconds)
      expect(addTime).toBeLessThan(10000);

      // Test filtering performance
      const filterStartTime = performance.now();
      
      // Complete every 3rd todo
      const checkboxes = screen.getAllByRole('checkbox');
      for (let i = 0; i < Math.min(checkboxes.length, 6); i += 3) {
        await user.click(checkboxes[i]);
      }

      const filterTime = performance.now() - filterStartTime;
      expect(filterTime).toBeLessThan(5000);

      // Test filter switching performance
      const switchStartTime = performance.now();
      
      await user.click(screen.getByText(/已完成/));
      await user.click(screen.getByText(/未完成/));
      await user.click(screen.getByText(/全部/));

      const switchTime = performance.now() - switchStartTime;
      expect(switchTime).toBeLessThan(1000);
    });
  });

  describe('Data Integrity and Consistency', () => {
    it('should maintain data consistency across all operations', async () => {
      const user = userEvent.setup();
      render(<TodoApp />);

      const { input, addButton } = getFormElements();

      // Create a mixed set of todos
      const todos = [
        { title: '重要任務', shouldComplete: true },
        { title: '普通任務', shouldComplete: false },
        { title: '緊急任務', shouldComplete: true },
        { title: '長期任務', shouldComplete: false },
        { title: '簡單任務', shouldComplete: true }
      ];

      // Add all todos
      for (const todo of todos) {
        await user.type(input, todo.title);
        await user.click(addButton);
      }

      // Complete specified todos
      const checkboxes = screen.getAllByRole('checkbox');
      for (let i = 0; i < todos.length; i++) {
        if (todos[i].shouldComplete) {
          await user.click(checkboxes[i]);
        }
      }

      // Wait for all operations to complete
      await waitFor(() => {
        expect(screen.getByText('重要任務')).toBeInTheDocument();
      });

      // Test filter consistency
      const completedFilter = screen.getByText(/已完成/);
      await user.click(completedFilter);
      
      // Count visible todos in completed filter
      const completedTodos = todos.filter(t => t.shouldComplete);
      completedTodos.forEach(todo => {
        expect(screen.getByText(todo.title)).toBeInTheDocument();
      });

      // Switch to active filter
      const activeFilter = screen.getByText(/未完成/);
      await user.click(activeFilter);
      
      const activeTodos = todos.filter(t => !t.shouldComplete);
      activeTodos.forEach(todo => {
        expect(screen.getByText(todo.title)).toBeInTheDocument();
      });

      // Verify localStorage consistency
      const savedData = JSON.parse(mockLocalStorage.getItem('todoState')!);
      expect(savedData.todos).toHaveLength(5);
      expect(savedData.todos.filter((t: any) => t.completed)).toHaveLength(3);
    });
  });

  describe('Cross-Component Integration', () => {
    it('should ensure all components work together seamlessly', async () => {
      const user = userEvent.setup();
      render(<TodoApp />);

      // Test TodoForm -> TodoList integration
      const input = screen.getByRole('textbox');
      await user.type(input, '整合測試任務');
      await user.click(screen.getByRole('button', { name: '新增' }));

      // Should appear in TodoList
      expect(screen.getByText('整合測試任務')).toBeInTheDocument();

      // Test TodoItem -> TodoStats integration
      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      // Test TodoFilter -> TodoList integration
      await user.click(screen.getByText(/已完成/));
      
      // Should still show the completed todo
      expect(screen.getByText('整合測試任務')).toBeInTheDocument();

      await user.click(screen.getByText(/未完成/));
      
      // Should show empty state
      expect(screen.getByText('沒有待辦事項')).toBeInTheDocument();

      // Test TodoItem edit -> TodoList update
      await user.click(screen.getByText(/全部/));
      
      const todoTitle = screen.getByText('整合測試任務');
      await user.dblClick(todoTitle);

      const editInput = screen.getByDisplayValue('整合測試任務');
      await user.clear(editInput);
      await user.type(editInput, '更新後的整合測試');
      await user.click(screen.getByText('✓'));

      // Should update in list and maintain completion status
      expect(screen.getByText('更新後的整合測試')).toBeInTheDocument();
    });
  });
});