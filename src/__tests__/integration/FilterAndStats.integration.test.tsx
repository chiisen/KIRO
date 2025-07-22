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

describe('Filter and Statistics Integration Tests', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
  });

  describe('Filter Functionality Integration', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<TodoApp />);

      // Set up test data: 5 todos with mixed completion states
      const input = screen.getByPlaceholderText('輸入新的待辦事項...');
      const addButton = screen.getByText('新增');

      const todos = [
        '購買雜貨',
        '完成報告',
        '運動30分鐘',
        '閱讀書籍',
        '整理房間',
      ];

      // Add all todos
      for (const todo of todos) {
        await user.type(input, todo);
        await user.click(addButton);
      }

      // Complete some todos (1st, 3rd, and 5th)
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[0]); // 購買雜貨
      await user.click(checkboxes[2]); // 運動30分鐘
      await user.click(checkboxes[4]); // 整理房間
    });

    it('should filter todos correctly and maintain filter state', async () => {
      const user = userEvent.setup();

      // Initial state - all todos visible
      expect(screen.getByText('購買雜貨')).toBeInTheDocument();
      expect(screen.getByText('完成報告')).toBeInTheDocument();
      expect(screen.getByText('運動30分鐘')).toBeInTheDocument();
      expect(screen.getByText('閱讀書籍')).toBeInTheDocument();
      expect(screen.getByText('整理房間')).toBeInTheDocument();

      // Test Active filter
      const activeFilter = screen.getByText('未完成 (2)');
      await user.click(activeFilter);

      // Should show only uncompleted todos
      expect(screen.queryByText('購買雜貨')).not.toBeInTheDocument();
      expect(screen.getByText('完成報告')).toBeInTheDocument();
      expect(screen.queryByText('運動30分鐘')).not.toBeInTheDocument();
      expect(screen.getByText('閱讀書籍')).toBeInTheDocument();
      expect(screen.queryByText('整理房間')).not.toBeInTheDocument();

      // Test Completed filter
      const completedFilter = screen.getByText('已完成 (3)');
      await user.click(completedFilter);

      // Should show only completed todos
      expect(screen.getByText('購買雜貨')).toBeInTheDocument();
      expect(screen.queryByText('完成報告')).not.toBeInTheDocument();
      expect(screen.getByText('運動30分鐘')).toBeInTheDocument();
      expect(screen.queryByText('閱讀書籍')).not.toBeInTheDocument();
      expect(screen.getByText('整理房間')).toBeInTheDocument();

      // Test All filter
      const allFilter = screen.getByText('全部 (5)');
      await user.click(allFilter);

      // Should show all todos again
      expect(screen.getByText('購買雜貨')).toBeInTheDocument();
      expect(screen.getByText('完成報告')).toBeInTheDocument();
      expect(screen.getByText('運動30分鐘')).toBeInTheDocument();
      expect(screen.getByText('閱讀書籍')).toBeInTheDocument();
      expect(screen.getByText('整理房間')).toBeInTheDocument();
    });

    it('should update filter counts dynamically', async () => {
      const user = userEvent.setup();

      // Initial counts
      expect(screen.getByText('全部 (5)')).toBeInTheDocument();
      expect(screen.getByText('未完成 (2)')).toBeInTheDocument();
      expect(screen.getByText('已完成 (3)')).toBeInTheDocument();

      // Complete one more todo
      const checkboxes = screen.getAllByRole('checkbox');
      const uncompletedCheckbox = checkboxes.find(checkbox => !checkbox.checked);
      await user.click(uncompletedCheckbox!);

      // Counts should update
      expect(screen.getByText('全部 (5)')).toBeInTheDocument();
      expect(screen.getByText('未完成 (1)')).toBeInTheDocument();
      expect(screen.getByText('已完成 (4)')).toBeInTheDocument();

      // Add a new todo
      const input = screen.getByPlaceholderText('輸入新的待辦事項...');
      const addButton = screen.getByText('新增');

      await user.type(input, '新增的任務');
      await user.click(addButton);

      // Counts should update again
      expect(screen.getByText('全部 (6)')).toBeInTheDocument();
      expect(screen.getByText('未完成 (2)')).toBeInTheDocument();
      expect(screen.getByText('已完成 (4)')).toBeInTheDocument();
    });

    it('should handle empty filter states correctly', async () => {
      const user = userEvent.setup();

      // Complete all todos
      const checkboxes = screen.getAllByRole('checkbox');
      for (const checkbox of checkboxes) {
        if (!checkbox.checked) {
          await user.click(checkbox);
        }
      }

      // Switch to active filter - should show empty state
      const activeFilter = screen.getByText('未完成 (0)');
      await user.click(activeFilter);

      expect(screen.getByText('沒有待辦事項')).toBeInTheDocument();

      // Switch to completed filter - should show all todos
      const completedFilter = screen.getByText('已完成 (5)');
      await user.click(completedFilter);

      expect(screen.queryByText('沒有待辦事項')).not.toBeInTheDocument();
      expect(screen.getByText('購買雜貨')).toBeInTheDocument();

      // Uncomplete all todos
      const allCheckboxes = screen.getAllByRole('checkbox');
      for (const checkbox of allCheckboxes) {
        if (checkbox.checked) {
          await user.click(checkbox);
        }
      }

      // Now completed filter should show empty state
      expect(screen.getByText('沒有待辦事項')).toBeInTheDocument();

      // Switch to active filter - should show all todos
      const activeFilterAgain = screen.getByText('未完成 (5)');
      await user.click(activeFilterAgain);

      expect(screen.queryByText('沒有待辦事項')).not.toBeInTheDocument();
      expect(screen.getByText('購買雜貨')).toBeInTheDocument();
    });
  });

  describe('Statistics Integration', () => {
    it('should calculate and display accurate statistics', async () => {
      const user = userEvent.setup();
      render(<TodoApp />);

      // Initial empty state
      expect(screen.getByText('總計: 0')).toBeInTheDocument();
      expect(screen.getByText('已完成: 0')).toBeInTheDocument();
      expect(screen.getByText('未完成: 0')).toBeInTheDocument();
      expect(screen.getByText('0%')).toBeInTheDocument();

      // Add todos and verify statistics update
      const input = screen.getByPlaceholderText('輸入新的待辦事項...');
      const addButton = screen.getByText('新增');

      // Add 4 todos
      const todos = ['任務A', '任務B', '任務C', '任務D'];
      for (const todo of todos) {
        await user.type(input, todo);
        await user.click(addButton);
      }

      // All uncompleted
      expect(screen.getByText('總計: 4')).toBeInTheDocument();
      expect(screen.getByText('已完成: 0')).toBeInTheDocument();
      expect(screen.getByText('未完成: 4')).toBeInTheDocument();
      expect(screen.getByText('0%')).toBeInTheDocument();

      // Complete 1 todo (25%)
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[0]);

      expect(screen.getByText('總計: 4')).toBeInTheDocument();
      expect(screen.getByText('已完成: 1')).toBeInTheDocument();
      expect(screen.getByText('未完成: 3')).toBeInTheDocument();
      expect(screen.getByText('25%')).toBeInTheDocument();

      // Complete 2 more todos (75%)
      await user.click(checkboxes[1]);
      await user.click(checkboxes[2]);

      expect(screen.getByText('總計: 4')).toBeInTheDocument();
      expect(screen.getByText('已完成: 3')).toBeInTheDocument();
      expect(screen.getByText('未完成: 1')).toBeInTheDocument();
      expect(screen.getByText('75%')).toBeInTheDocument();

      // Complete all todos (100%)
      await user.click(checkboxes[3]);

      expect(screen.getByText('總計: 4')).toBeInTheDocument();
      expect(screen.getByText('已完成: 4')).toBeInTheDocument();
      expect(screen.getByText('未完成: 0')).toBeInTheDocument();
      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('should handle percentage calculations correctly for various scenarios', async () => {
      const user = userEvent.setup();
      render(<TodoApp />);

      const input = screen.getByPlaceholderText('輸入新的待辦事項...');
      const addButton = screen.getByText('新增');

      // Test with 3 todos (33.33% increments)
      for (let i = 1; i <= 3; i++) {
        await user.type(input, `任務${i}`);
        await user.click(addButton);
      }

      const checkboxes = screen.getAllByRole('checkbox');

      // 1/3 completed (33%)
      await user.click(checkboxes[0]);
      expect(screen.getByText('33%')).toBeInTheDocument();

      // 2/3 completed (67%)
      await user.click(checkboxes[1]);
      expect(screen.getByText('67%')).toBeInTheDocument();

      // Test with 7 todos for more complex percentages
      for (let i = 4; i <= 7; i++) {
        await user.type(input, `任務${i}`);
        await user.click(addButton);
      }

      // 2/7 completed (29%)
      expect(screen.getByText('29%')).toBeInTheDocument();

      // Complete 3 more (5/7 = 71%)
      const newCheckboxes = screen.getAllByRole('checkbox');
      await user.click(newCheckboxes[2]);
      await user.click(newCheckboxes[3]);
      await user.click(newCheckboxes[4]);

      expect(screen.getByText('71%')).toBeInTheDocument();
    });

    it('should update statistics when todos are deleted', async () => {
      const user = userEvent.setup();
      render(<TodoApp />);

      // Mock window.confirm to always return true
      const mockConfirm = jest.fn(() => true);
      Object.defineProperty(window, 'confirm', { value: mockConfirm });

      const input = screen.getByPlaceholderText('輸入新的待辦事項...');
      const addButton = screen.getByText('新增');

      // Add 5 todos
      for (let i = 1; i <= 5; i++) {
        await user.type(input, `任務${i}`);
        await user.click(addButton);
      }

      // Complete 3 todos
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[0]);
      await user.click(checkboxes[1]);
      await user.click(checkboxes[2]);

      // Initial state: 5 total, 3 completed, 2 uncompleted (60%)
      expect(screen.getByText('總計: 5')).toBeInTheDocument();
      expect(screen.getByText('已完成: 3')).toBeInTheDocument();
      expect(screen.getByText('未完成: 2')).toBeInTheDocument();
      expect(screen.getByText('60%')).toBeInTheDocument();

      // Delete 1 completed todo
      const deleteButtons = screen.getAllByText('🗑️');
      await user.click(deleteButtons[0]);

      // Should be: 4 total, 2 completed, 2 uncompleted (50%)
      expect(screen.getByText('總計: 4')).toBeInTheDocument();
      expect(screen.getByText('已完成: 2')).toBeInTheDocument();
      expect(screen.getByText('未完成: 2')).toBeInTheDocument();
      expect(screen.getByText('50%')).toBeInTheDocument();

      // Delete 1 uncompleted todo
      const remainingDeleteButtons = screen.getAllByText('🗑️');
      // Find an uncompleted todo to delete (should be one of the last ones)
      await user.click(remainingDeleteButtons[2]); // Delete 4th todo (uncompleted)

      // Should be: 3 total, 2 completed, 1 uncompleted (67%)
      expect(screen.getByText('總計: 3')).toBeInTheDocument();
      expect(screen.getByText('已完成: 2')).toBeInTheDocument();
      expect(screen.getByText('未完成: 1')).toBeInTheDocument();
      expect(screen.getByText('67%')).toBeInTheDocument();
    });

    it('should update statistics when todos are edited', async () => {
      const user = userEvent.setup();
      render(<TodoApp />);

      const input = screen.getByPlaceholderText('輸入新的待辦事項...');
      const addButton = screen.getByText('新增');

      // Add 2 todos
      await user.type(input, '原始任務1');
      await user.click(addButton);

      await user.type(input, '原始任務2');
      await user.click(addButton);

      // Complete 1 todo
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[0]);

      // Initial statistics
      expect(screen.getByText('總計: 2')).toBeInTheDocument();
      expect(screen.getByText('已完成: 1')).toBeInTheDocument();
      expect(screen.getByText('未完成: 1')).toBeInTheDocument();
      expect(screen.getByText('50%')).toBeInTheDocument();

      // Edit a todo (should not affect statistics)
      const todoTitle = screen.getByText('原始任務1');
      await user.dblClick(todoTitle);

      const editInput = screen.getByDisplayValue('原始任務1');
      await user.clear(editInput);
      await user.type(editInput, '編輯後的任務1');

      const confirmButton = screen.getByText('✓');
      await user.click(confirmButton);

      // Statistics should remain the same
      expect(screen.getByText('總計: 2')).toBeInTheDocument();
      expect(screen.getByText('已完成: 1')).toBeInTheDocument();
      expect(screen.getByText('未完成: 1')).toBeInTheDocument();
      expect(screen.getByText('50%')).toBeInTheDocument();

      // But the title should be updated
      expect(screen.getByText('編輯後的任務1')).toBeInTheDocument();
      expect(screen.queryByText('原始任務1')).not.toBeInTheDocument();
    });
  });

  describe('Filter and Statistics Interaction', () => {
    it('should maintain accurate statistics regardless of active filter', async () => {
      const user = userEvent.setup();
      render(<TodoApp />);

      const input = screen.getByPlaceholderText('輸入新的待辦事項...');
      const addButton = screen.getByText('新增');

      // Add 6 todos
      for (let i = 1; i <= 6; i++) {
        await user.type(input, `任務${i}`);
        await user.click(addButton);
      }

      // Complete 4 todos
      const checkboxes = screen.getAllByRole('checkbox');
      for (let i = 0; i < 4; i++) {
        await user.click(checkboxes[i]);
      }

      // Test statistics in "All" filter
      expect(screen.getByText('總計: 6')).toBeInTheDocument();
      expect(screen.getByText('已完成: 4')).toBeInTheDocument();
      expect(screen.getByText('未完成: 2')).toBeInTheDocument();
      expect(screen.getByText('67%')).toBeInTheDocument();

      // Switch to "Active" filter
      const activeFilter = screen.getByText('未完成 (2)');
      await user.click(activeFilter);

      // Statistics should remain the same
      expect(screen.getByText('總計: 6')).toBeInTheDocument();
      expect(screen.getByText('已完成: 4')).toBeInTheDocument();
      expect(screen.getByText('未完成: 2')).toBeInTheDocument();
      expect(screen.getByText('67%')).toBeInTheDocument();

      // Switch to "Completed" filter
      const completedFilter = screen.getByText('已完成 (4)');
      await user.click(completedFilter);

      // Statistics should still remain the same
      expect(screen.getByText('總計: 6')).toBeInTheDocument();
      expect(screen.getByText('已完成: 4')).toBeInTheDocument();
      expect(screen.getByText('未完成: 2')).toBeInTheDocument();
      expect(screen.getByText('67%')).toBeInTheDocument();
    });

    it('should update filter counts when operations are performed in filtered view', async () => {
      const user = userEvent.setup();
      render(<TodoApp />);

      const input = screen.getByPlaceholderText('輸入新的待辦事項...');
      const addButton = screen.getByText('新增');

      // Add 4 todos
      for (let i = 1; i <= 4; i++) {
        await user.type(input, `任務${i}`);
        await user.click(addButton);
      }

      // Complete 2 todos
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[0]);
      await user.click(checkboxes[1]);

      // Switch to active filter
      const activeFilter = screen.getByText('未完成 (2)');
      await user.click(activeFilter);

      // Complete one more todo from the active view
      const activeCheckboxes = screen.getAllByRole('checkbox');
      await user.click(activeCheckboxes[0]);

      // Filter counts should update
      expect(screen.getByText('全部 (4)')).toBeInTheDocument();
      expect(screen.getByText('未完成 (1)')).toBeInTheDocument();
      expect(screen.getByText('已完成 (3)')).toBeInTheDocument();

      // Switch to completed filter
      const completedFilter = screen.getByText('已完成 (3)');
      await user.click(completedFilter);

      // Uncomplete one todo from the completed view
      const completedCheckboxes = screen.getAllByRole('checkbox');
      await user.click(completedCheckboxes[0]);

      // Filter counts should update again
      expect(screen.getByText('全部 (4)')).toBeInTheDocument();
      expect(screen.getByText('未完成 (2)')).toBeInTheDocument();
      expect(screen.getByText('已完成 (2)')).toBeInTheDocument();
    });

    it('should handle adding todos while in filtered view', async () => {
      const user = userEvent.setup();
      render(<TodoApp />);

      const input = screen.getByPlaceholderText('輸入新的待辦事項...');
      const addButton = screen.getByText('新增');

      // Add and complete 2 todos
      await user.type(input, '已完成任務1');
      await user.click(addButton);

      await user.type(input, '已完成任務2');
      await user.click(addButton);

      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[0]);
      await user.click(checkboxes[1]);

      // Switch to completed filter
      const completedFilter = screen.getByText('已完成 (2)');
      await user.click(completedFilter);

      // Add a new todo while in completed filter
      await user.type(input, '新的未完成任務');
      await user.click(addButton);

      // Should still be in completed filter, but counts should update
      expect(screen.getByText('全部 (3)')).toBeInTheDocument();
      expect(screen.getByText('未完成 (1)')).toBeInTheDocument();
      expect(screen.getByText('已完成 (2)')).toBeInTheDocument();

      // New todo should not be visible in completed filter
      expect(screen.queryByText('新的未完成任務')).not.toBeInTheDocument();

      // Switch to all filter to see the new todo
      const allFilter = screen.getByText('全部 (3)');
      await user.click(allFilter);

      expect(screen.getByText('新的未完成任務')).toBeInTheDocument();
    });
  });
});