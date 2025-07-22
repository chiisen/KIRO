import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoForm } from './TodoForm';
import { TodoProvider } from '../../context/TodoContext';
import { Todo } from '../../types/todo';

// Mock the useTodos hook
const mockAddTodo = jest.fn();
const mockUseTodos = {
  addTodo: mockAddTodo,
  todos: [],
  filteredTodos: [],
  filter: 'all' as const,
  toggleTodo: jest.fn(),
  updateTodo: jest.fn(),
  deleteTodo: jest.fn(),
  setFilter: jest.fn()
};

jest.mock('../../hooks/useTodos', () => ({
  useTodos: () => mockUseTodos
}));

// Helper component to wrap TodoForm with context
const TodoFormWrapper: React.FC<{
  initialTodos?: Todo[];
  children?: React.ReactNode;
}> = ({ initialTodos = [], children }) => (
  <TodoProvider initialState={{ todos: initialTodos, filter: 'all' }}>
    {children || <TodoForm />}
  </TodoProvider>
);

describe('TodoForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders form with input and submit button', () => {
      render(
        <TodoFormWrapper>
          <TodoForm />
        </TodoFormWrapper>
      );

      expect(screen.getByRole('textbox', { name: /新增待辦事項/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /新增/i })).toBeInTheDocument();
      expect(screen.getByPlaceholderText('新增待辦事項...')).toBeInTheDocument();
    });

    it('renders with custom placeholder', () => {
      render(
        <TodoFormWrapper>
          <TodoForm placeholder="自定義提示文字" />
        </TodoFormWrapper>
      );

      expect(screen.getByPlaceholderText('自定義提示文字')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(
        <TodoFormWrapper>
          <TodoForm className="custom-form-class" />
        </TodoFormWrapper>
      );

      expect(screen.getByRole('textbox').closest('.todo-form-container')).toHaveClass('custom-form-class');
    });

    it('has proper form structure and accessibility attributes', () => {
      render(
        <TodoFormWrapper>
          <TodoForm />
        </TodoFormWrapper>
      );

      const form = screen.getByRole('textbox').closest('form');
      expect(form).toBeInTheDocument();
      expect(form).toHaveAttribute('noValidate');

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-label', '新增待辦事項');
      expect(input).toHaveAttribute('maxLength', '200');

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', '新增待辦事項');
    });
  });

  describe('Form Submission', () => {
    it('calls addTodo when form is submitted with valid input', async () => {
      const user = userEvent.setup();
      
      render(
        <TodoFormWrapper>
          <TodoForm />
        </TodoFormWrapper>
      );

      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button', { name: /新增/i });

      await user.type(input, '新的待辦事項');
      await user.click(button);

      expect(mockAddTodo).toHaveBeenCalledWith('新的待辦事項');
    });

    it('clears input after successful submission', async () => {
      const user = userEvent.setup();
      
      render(
        <TodoFormWrapper>
          <TodoForm />
        </TodoFormWrapper>
      );

      const input = screen.getByRole('textbox') as HTMLInputElement;
      const button = screen.getByRole('button', { name: /新增/i });

      await user.type(input, '測試待辦事項');
      expect(input.value).toBe('測試待辦事項');

      await user.click(button);

      await waitFor(() => {
        expect(input.value).toBe('');
      });
    });

    it('calls onTodoAdded callback when provided', async () => {
      const user = userEvent.setup();
      const mockCallback = jest.fn();
      
      render(
        <TodoFormWrapper>
          <TodoForm onTodoAdded={mockCallback} />
        </TodoFormWrapper>
      );

      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button', { name: /新增/i });

      await user.type(input, '回調測試');
      await user.click(button);

      expect(mockCallback).toHaveBeenCalledWith('回調測試');
    });

    it('handles Enter key submission', async () => {
      const user = userEvent.setup();
      
      render(
        <TodoFormWrapper>
          <TodoForm />
        </TodoFormWrapper>
      );

      const input = screen.getByRole('textbox');

      await user.type(input, '按Enter提交');
      await user.keyboard('{Enter}');

      expect(mockAddTodo).toHaveBeenCalledWith('按Enter提交');
    });

    it('does not submit when Shift+Enter is pressed', async () => {
      const user = userEvent.setup();
      
      render(
        <TodoFormWrapper>
          <TodoForm />
        </TodoFormWrapper>
      );

      const input = screen.getByRole('textbox');

      await user.type(input, '測試Shift+Enter');
      
      // Clear the mock to ensure we're only testing the Shift+Enter behavior
      mockAddTodo.mockClear();
      
      // Press Shift+Enter - this should NOT submit the form
      await user.keyboard('{Shift>}{Enter}{/Shift}');

      // The form should not have been submitted
      expect(mockAddTodo).not.toHaveBeenCalled();
      
      // The input should still contain the text
      expect(input).toHaveValue('測試Shift+Enter');
    });
  });

  describe('Input Validation', () => {
    it('shows error when trying to submit empty input', async () => {
      const user = userEvent.setup();
      
      render(
        <TodoFormWrapper>
          <TodoForm />
        </TodoFormWrapper>
      );

      const button = screen.getByRole('button', { name: /新增/i });
      await user.click(button);

      expect(screen.getByText('請輸入待辦事項內容')).toBeInTheDocument();
      expect(mockAddTodo).not.toHaveBeenCalled();
    });

    it('shows error when trying to submit whitespace-only input', async () => {
      const user = userEvent.setup();
      
      render(
        <TodoFormWrapper>
          <TodoForm />
        </TodoFormWrapper>
      );

      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button', { name: /新增/i });

      await user.type(input, '   ');
      await user.click(button);

      expect(screen.getByText('請輸入待辦事項內容')).toBeInTheDocument();
      expect(mockAddTodo).not.toHaveBeenCalled();
    });

    it('shows error when input exceeds 200 characters', async () => {
      const user = userEvent.setup();
      const longText = 'a'.repeat(201);
      
      render(
        <TodoFormWrapper>
          <TodoForm />
        </TodoFormWrapper>
      );

      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button', { name: /新增/i });

      await user.type(input, longText);
      await user.click(button);

      expect(screen.getByText('待辦事項內容不能超過 200 個字元')).toBeInTheDocument();
      expect(mockAddTodo).not.toHaveBeenCalled();
    });

    it('clears error when user starts typing', async () => {
      const user = userEvent.setup();
      
      render(
        <TodoFormWrapper>
          <TodoForm />
        </TodoFormWrapper>
      );

      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button', { name: /新增/i });

      // Trigger error
      await user.click(button);
      expect(screen.getByText('請輸入待辦事項內容')).toBeInTheDocument();

      // Start typing to clear error
      await user.type(input, '新內容');
      expect(screen.queryByText('請輸入待辦事項內容')).not.toBeInTheDocument();
    });

    it('applies error styling to input when validation fails', async () => {
      const user = userEvent.setup();
      
      render(
        <TodoFormWrapper>
          <TodoForm />
        </TodoFormWrapper>
      );

      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button', { name: /新增/i });

      await user.click(button);

      expect(input).toHaveClass('todo-form-input--error');
    });
  });

  describe('Button States', () => {
    it('enables submit button even when input is empty (validation handles errors)', () => {
      render(
        <TodoFormWrapper>
          <TodoForm />
        </TodoFormWrapper>
      );

      const button = screen.getByRole('button', { name: /新增/i });
      expect(button).toBeEnabled();
    });

    it('enables submit button when input has content', async () => {
      const user = userEvent.setup();
      
      render(
        <TodoFormWrapper>
          <TodoForm />
        </TodoFormWrapper>
      );

      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button', { name: /新增/i });

      await user.type(input, '有內容');
      expect(button).toBeEnabled();
    });

    it('shows loading state during submission', async () => {
      const user = userEvent.setup();
      
      // Mock addTodo to return a pending promise
      mockAddTodo.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      render(
        <TodoFormWrapper>
          <TodoForm />
        </TodoFormWrapper>
      );

      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button', { name: /新增/i });

      await user.type(input, '測試載入狀態');
      await user.click(button);

      expect(screen.getByText('新增中...')).toBeInTheDocument();
      expect(button).toBeDisabled();
      expect(input).toBeDisabled();
    });
  });

  describe('Error Handling', () => {
    it('displays error message when addTodo throws an error', async () => {
      const user = userEvent.setup();
      const errorMessage = '新增失敗';
      
      mockAddTodo.mockRejectedValueOnce(new Error(errorMessage));
      
      render(
        <TodoFormWrapper>
          <TodoForm />
        </TodoFormWrapper>
      );

      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button', { name: /新增/i });

      await user.type(input, '會失敗的待辦事項');
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('displays generic error message for unknown errors', async () => {
      const user = userEvent.setup();
      
      mockAddTodo.mockRejectedValueOnce('Unknown error');
      
      render(
        <TodoFormWrapper>
          <TodoForm />
        </TodoFormWrapper>
      );

      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button', { name: /新增/i });

      await user.type(input, '未知錯誤測試');
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText('新增待辦事項時發生錯誤')).toBeInTheDocument();
      });
    });

    it('has proper ARIA attributes for error messages', async () => {
      const user = userEvent.setup();
      
      render(
        <TodoFormWrapper>
          <TodoForm />
        </TodoFormWrapper>
      );

      const button = screen.getByRole('button', { name: /新增/i });
      await user.click(button);

      const errorElement = screen.getByText('請輸入待辦事項內容');
      expect(errorElement).toHaveAttribute('role', 'alert');
      expect(errorElement).toHaveAttribute('aria-live', 'polite');
      expect(errorElement).toHaveAttribute('id', 'todo-form-error');

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'todo-form-error');
    });
  });

  describe('Requirements Verification', () => {
    // 需求 1.1: WHEN 使用者點擊「新增任務」按鈕 THEN 系統 SHALL 顯示輸入欄位
    it('displays input field when component renders (Requirement 1.1)', () => {
      render(
        <TodoFormWrapper>
          <TodoForm />
        </TodoFormWrapper>
      );

      expect(screen.getByRole('textbox')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /新增/i })).toBeInTheDocument();
    });

    // 需求 1.2: WHEN 使用者輸入任務標題並按下確認 THEN 系統 SHALL 將新任務加入清單
    it('adds new task when user inputs title and confirms (Requirement 1.2)', async () => {
      const user = userEvent.setup();
      
      render(
        <TodoFormWrapper>
          <TodoForm />
        </TodoFormWrapper>
      );

      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button', { name: /新增/i });

      await user.type(input, '新任務');
      await user.click(button);

      expect(mockAddTodo).toHaveBeenCalledWith('新任務');
    });

    // 需求 1.3: WHEN 使用者嘗試新增空白任務 THEN 系統 SHALL 顯示錯誤訊息
    it('shows error message when user tries to add empty task (Requirement 1.3)', async () => {
      const user = userEvent.setup();
      
      render(
        <TodoFormWrapper>
          <TodoForm />
        </TodoFormWrapper>
      );

      const button = screen.getByRole('button', { name: /新增/i });
      await user.click(button);

      expect(screen.getByText('請輸入待辦事項內容')).toBeInTheDocument();
      expect(mockAddTodo).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('handles rapid successive submissions', async () => {
      const user = userEvent.setup();
      
      render(
        <TodoFormWrapper>
          <TodoForm />
        </TodoFormWrapper>
      );

      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button', { name: /新增/i });

      await user.type(input, '快速提交測試');
      
      // Rapid clicks
      await user.click(button);
      await user.click(button);
      await user.click(button);

      // Should only be called once due to isSubmitting state
      expect(mockAddTodo).toHaveBeenCalledTimes(1);
    });

    it('handles special characters in input', async () => {
      const user = userEvent.setup();
      const specialText = '特殊字元 @#$%^&*() <script>alert("test")</script>';
      
      render(
        <TodoFormWrapper>
          <TodoForm />
        </TodoFormWrapper>
      );

      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button', { name: /新增/i });

      await user.type(input, specialText);
      await user.click(button);

      expect(mockAddTodo).toHaveBeenCalledWith(specialText);
    });

    it('handles exactly 200 character input', async () => {
      const user = userEvent.setup();
      const exactLengthText = 'a'.repeat(200);
      
      render(
        <TodoFormWrapper>
          <TodoForm />
        </TodoFormWrapper>
      );

      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button', { name: /新增/i });

      await user.type(input, exactLengthText);
      await user.click(button);

      expect(mockAddTodo).toHaveBeenCalledWith(exactLengthText);
      expect(screen.queryByText('待辦事項內容不能超過 200 個字元')).not.toBeInTheDocument();
    });
  });
});