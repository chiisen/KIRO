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

describe('TodoApp Integration Tests', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    mockLocalStorage.clear();
    // Reset confirm mock
    mockConfirm.mockReset();
    mockConfirm.mockReturnValue(true); // Default to confirming deletions
  });

  describe('Complete Todo Management Flow', () => {
    it('should handle complete todo lifecycle: add, edit, toggle, delete', async () => {
      const user = userEvent.setup();
      render(<TodoApp />);

      // Verify initial empty state
      expect(screen.getByText('沒有待辦事項')).toBeInTheDocument();
      expect(screen.getByText('總計: 0')).toBeInTheDocument();
      expect(screen.getByText('已完成: 0')).toBeInTheDocument();
      expect(screen.getByText('未完成: 0')).toBeInTheDocument();

      // Add first todo
      const input = screen.getByPlaceholderText('新增待辦事項...');
      const addButton = screen.getByRole('button', { name: '新增待辦事項' });

      await user.type(input, '學習 React');
      await user.click(addButton);

      // Verify todo was added
      expect(screen.getByText('學習 React')).toBeInTheDocument();
      expect(screen.getByText('總計: 1')).toBeInTheDocument();
      expect(screen.getByText('未完成: 1')).toBeInTheDocument();
      expect(screen.getByText('已完成: 0')).toBeInTheDocument();

      // Add second todo
      await user.type(input, '寫測試');
      await user.click(addButton);

      // Verify both todos exist
      expect(screen.getByText('學習 React')).toBeInTheDocument();
      expect(screen.getByText('寫測試')).toBeInTheDocument();
      expect(screen.getByText('總計: 2')).toBeInTheDocument();
      expect(screen.getByText('未完成: 2')).toBeInTheDocument();

      // Toggle first todo to completed
      const firstCheckbox = screen.getAllByRole('checkbox')[0];
      await user.click(firstCheckbox);

      // Verify completion status
      expect(screen.getByText('總計: 2')).toBeInTheDocument();
      expect(screen.getByText('已完成: 1')).toBeInTheDocument();
      expect(screen.getByText('未完成: 1')).toBeInTheDocument();

      // Edit the second todo
      const secondTodoTitle = screen.getByText('寫測試');
      await user.dblClick(secondTodoTitle);

      // Find the edit input and update the title
      const editInput = screen.getByDisplayValue('寫測試');
      await user.clear(editInput);
      await user.type(editInput, '寫整合測試');
      
      // Confirm the edit
      const confirmButton = screen.getByText('✓');
      await user.click(confirmButton);

      // Verify the edit was applied
      expect(screen.getByText('寫整合測試')).toBeInTheDocument();
      expect(screen.queryByText('寫測試')).not.toBeInTheDocument();

      // Delete the first todo
      const deleteButtons = screen.getAllByText('🗑️');
      await user.click(deleteButtons[0]);

      // Verify deletion
      expect(screen.queryByText('學習 React')).not.toBeInTheDocument();
      expect(screen.getByText('寫整合測試')).toBeInTheDocument();
      expect(screen.getByText('總計: 1')).toBeInTheDocument();
      expect(screen.getByText('未完成: 1')).toBeInTheDocument();
      expect(screen.getByText('已完成: 0')).toBeInTheDocument();
    });

    it('should handle input validation correctly', async () => {
      const user = userEvent.setup();
      render(<TodoApp />);

      const input = screen.getByPlaceholderText('新增待辦事項...');
      const addButton = screen.getByRole('button', { name: '新增待辦事項' });

      // Try to add empty todo
      await user.click(addButton);
      expect(screen.getByText('請輸入待辦事項內容')).toBeInTheDocument();

      // Try to add whitespace-only todo
      await user.type(input, '   ');
      await user.click(addButton);
      expect(screen.getByText('請輸入待辦事項內容')).toBeInTheDocument();

      // Add valid todo
      await user.clear(input);
      await user.type(input, '有效的待辦事項');
      await user.click(addButton);

      expect(screen.getByText('有效的待辦事項')).toBeInTheDocument();
      expect(screen.queryByText('請輸入待辦事項內容')).not.toBeInTheDocument();
    });
  });

  describe('Filter Functionality', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<TodoApp />);

      // Add test todos
      const input = screen.getByPlaceholderText('新增待辦事項...');
      const addButton = screen.getByRole('button', { name: '新增待辦事項' });

      await user.type(input, '未完成任務1');
      await user.click(addButton);

      await user.type(input, '未完成任務2');
      await user.click(addButton);

      await user.type(input, '將完成的任務');
      await user.click(addButton);

      // Mark the third todo as completed
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[2]);
    });

    it('should filter todos correctly', async () => {
      const user = userEvent.setup();

      // Test "All" filter (default)
      expect(screen.getByText('未完成任務1')).toBeInTheDocument();
      expect(screen.getByText('未完成任務2')).toBeInTheDocument();
      expect(screen.getByText('將完成的任務')).toBeInTheDocument();

      // Test "Active" filter
      const activeFilter = screen.getByTestId('filter-active');
      await user.click(activeFilter);

      expect(screen.getByText('未完成任務1')).toBeInTheDocument();
      expect(screen.getByText('未完成任務2')).toBeInTheDocument();
      expect(screen.queryByText('將完成的任務')).not.toBeInTheDocument();

      // Test "Completed" filter
      const completedFilter = screen.getByTestId('filter-completed');
      await user.click(completedFilter);

      expect(screen.queryByText('未完成任務1')).not.toBeInTheDocument();
      expect(screen.queryByText('未完成任務2')).not.toBeInTheDocument();
      expect(screen.getByText('將完成的任務')).toBeInTheDocument();

      // Back to "All" filter
      const allFilter = screen.getByTestId('filter-all');
      await user.click(allFilter);

      expect(screen.getByText('未完成任務1')).toBeInTheDocument();
      expect(screen.getByText('未完成任務2')).toBeInTheDocument();
      expect(screen.getByText('將完成的任務')).toBeInTheDocument();
    });
  });

  describe('Data Persistence', () => {
    it('should persist todos in localStorage', async () => {
      const user = userEvent.setup();
      
      // First render - add some todos
      const { unmount } = render(<TodoApp />);

      const input = screen.getByPlaceholderText('新增待辦事項...');
      const addButton = screen.getByRole('button', { name: '新增待辦事項' });

      await user.type(input, '持久化測試');
      await user.click(addButton);

      // Toggle completion
      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      // Verify localStorage was updated
      const savedData = mockLocalStorage.getItem('todoState');
      expect(savedData).toBeTruthy();
      
      const parsedData = JSON.parse(savedData!);
      expect(parsedData.todos).toHaveLength(1);
      expect(parsedData.todos[0].title).toBe('持久化測試');
      expect(parsedData.todos[0].completed).toBe(true);

      // Unmount and remount to simulate page reload
      unmount();
      render(<TodoApp />);

      // Verify data was restored
      expect(screen.getByText('持久化測試')).toBeInTheDocument();
      expect(screen.getByText('總計: 1')).toBeInTheDocument();
      expect(screen.getByText('已完成: 1')).toBeInTheDocument();
      expect(screen.getByText('未完成: 0')).toBeInTheDocument();
    });

    it('should handle corrupted localStorage data gracefully', () => {
      // Set corrupted data in localStorage
      mockLocalStorage.setItem('todoState', 'invalid json');

      // Should render without crashing and show empty state
      render(<TodoApp />);
      expect(screen.getByText('沒有待辦事項')).toBeInTheDocument();
      expect(screen.getByText('總計: 0')).toBeInTheDocument();
    });
  });

  describe('Statistics and Progress', () => {
    it('should update statistics correctly as todos change', async () => {
      const user = userEvent.setup();
      render(<TodoApp />);

      const input = screen.getByPlaceholderText('新增待辦事項...');
      const addButton = screen.getByRole('button', { name: '新增待辦事項' });

      // Add 3 todos
      for (let i = 1; i <= 3; i++) {
        await user.type(input, `任務 ${i}`);
        await user.click(addButton);
      }

      // Verify initial statistics
      expect(screen.getByText('總計: 3')).toBeInTheDocument();
      expect(screen.getByText('未完成: 3')).toBeInTheDocument();
      expect(screen.getByText('已完成: 0')).toBeInTheDocument();
      expect(screen.getByText('0%')).toBeInTheDocument();

      // Complete 2 todos
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[0]);
      await user.click(checkboxes[1]);

      // Verify updated statistics
      expect(screen.getByText('總計: 3')).toBeInTheDocument();
      expect(screen.getByText('未完成: 1')).toBeInTheDocument();
      expect(screen.getByText('已完成: 2')).toBeInTheDocument();
      expect(screen.getByText('67%')).toBeInTheDocument();

      // Complete the last todo
      await user.click(checkboxes[2]);

      // Verify 100% completion
      expect(screen.getByText('總計: 3')).toBeInTheDocument();
      expect(screen.getByText('未完成: 0')).toBeInTheDocument();
      expect(screen.getByText('已完成: 3')).toBeInTheDocument();
      expect(screen.getByText('100%')).toBeInTheDocument();
    });
  });

  describe('Edit Functionality', () => {
    it('should handle edit cancellation', async () => {
      const user = userEvent.setup();
      render(<TodoApp />);

      // Add a todo
      const input = screen.getByPlaceholderText('新增待辦事項...');
      const addButton = screen.getByRole('button', { name: '新增待辦事項' });

      await user.type(input, '原始標題');
      await user.click(addButton);

      // Start editing
      const todoTitle = screen.getByText('原始標題');
      await user.dblClick(todoTitle);

      // Modify the input
      const editInput = screen.getByDisplayValue('原始標題');
      await user.clear(editInput);
      await user.type(editInput, '修改後的標題');

      // Cancel the edit
      const cancelButton = screen.getByText('✕');
      await user.click(cancelButton);

      // Verify original title is preserved
      expect(screen.getByText('原始標題')).toBeInTheDocument();
      expect(screen.queryByText('修改後的標題')).not.toBeInTheDocument();
    });

    it('should handle edit validation', async () => {
      const user = userEvent.setup();
      render(<TodoApp />);

      // Add a todo
      const input = screen.getByPlaceholderText('新增待辦事項...');
      const addButton = screen.getByRole('button', { name: '新增待辦事項' });

      await user.type(input, '原始標題');
      await user.click(addButton);

      // Start editing
      const todoTitle = screen.getByText('原始標題');
      await user.dblClick(todoTitle);

      // Try to save empty title
      const editInput = screen.getByDisplayValue('原始標題');
      await user.clear(editInput);

      const confirmButton = screen.getByText('✓');
      await user.click(confirmButton);

      // Should show error and remain in edit mode
      expect(screen.getByText('標題不能為空')).toBeInTheDocument();
      expect(screen.getByDisplayValue('')).toBeInTheDocument();
    });
  });

  describe('Delete Confirmation', () => {
    it('should handle delete confirmation dialog', async () => {
      const user = userEvent.setup();
      render(<TodoApp />);

      // Add a todo
      const input = screen.getByPlaceholderText('新增待辦事項...');
      const addButton = screen.getByRole('button', { name: '新增待辦事項' });

      await user.type(input, '要刪除的任務');
      await user.click(addButton);

      // Test canceling deletion
      mockConfirm.mockReturnValueOnce(false);
      const deleteButton = screen.getByText('🗑️');
      await user.click(deleteButton);

      // Todo should still exist
      expect(screen.getByText('要刪除的任務')).toBeInTheDocument();

      // Test confirming deletion
      mockConfirm.mockReturnValueOnce(true);
      await user.click(deleteButton);

      // Todo should be deleted
      expect(screen.queryByText('要刪除的任務')).not.toBeInTheDocument();
      expect(screen.getByText('沒有待辦事項')).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support Enter key for adding todos', async () => {
      const user = userEvent.setup();
      render(<TodoApp />);

      const input = screen.getByPlaceholderText('新增待辦事項...');

      // Type and press Enter
      await user.type(input, '用 Enter 新增');
      await user.keyboard('{Enter}');

      // Verify todo was added
      expect(screen.getByText('用 Enter 新增')).toBeInTheDocument();
      expect(input).toHaveValue(''); // Input should be cleared
    });

    it('should support Enter key for confirming edits', async () => {
      const user = userEvent.setup();
      render(<TodoApp />);

      // Add a todo
      const input = screen.getByPlaceholderText('新增待辦事項...');
      await user.type(input, '原始標題');
      await user.keyboard('{Enter}');

      // Start editing
      const todoTitle = screen.getByText('原始標題');
      await user.dblClick(todoTitle);

      // Edit and press Enter
      const editInput = screen.getByDisplayValue('原始標題');
      await user.clear(editInput);
      await user.type(editInput, '用 Enter 確認');
      await user.keyboard('{Enter}');

      // Verify edit was applied
      expect(screen.getByText('用 Enter 確認')).toBeInTheDocument();
      expect(screen.queryByText('原始標題')).not.toBeInTheDocument();
    });

    it('should support Escape key for canceling edits', async () => {
      const user = userEvent.setup();
      render(<TodoApp />);

      // Add a todo
      const input = screen.getByPlaceholderText('新增待辦事項...');
      await user.type(input, '原始標題');
      await user.keyboard('{Enter}');

      // Start editing
      const todoTitle = screen.getByText('原始標題');
      await user.dblClick(todoTitle);

      // Edit and press Escape
      const editInput = screen.getByDisplayValue('原始標題');
      await user.clear(editInput);
      await user.type(editInput, '不會保存的修改');
      await user.keyboard('{Escape}');

      // Verify edit was canceled
      expect(screen.getByText('原始標題')).toBeInTheDocument();
      expect(screen.queryByText('不會保存的修改')).not.toBeInTheDocument();
    });
  });
});