import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoForm } from '../TodoForm';
import { TodoProvider } from '../../../context/TodoContext';
import { useTodos } from '../../../hooks/useTodos';

// Mock the useTodos hook
jest.mock('../../../hooks/useTodos');
const mockUseTodos = useTodos as jest.MockedFunction<typeof useTodos>;

// Mock addTodo function
const mockAddTodo = jest.fn();

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <TodoProvider>{children}</TodoProvider>
);

describe('TodoForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTodos.mockReturnValue({
      addTodo: mockAddTodo,
      todos: [],
      filteredTodos: [],
      filter: 'all',
      stats: { total: 0, completed: 0, active: 0, completionPercentage: 0 },
      toggleTodo: jest.fn(),
      updateTodo: jest.fn(),
      deleteTodo: jest.fn(),
      setFilter: jest.fn(),
      loadTodos: jest.fn(),
      getTodoById: jest.fn(),
      clearCompleted: jest.fn(),
      toggleAll: jest.fn()
    });
  });

  describe('Rendering', () => {
    it('renders input field and submit button', () => {
      render(<TodoForm />, { wrapper: TestWrapper });
      
      expect(screen.getByRole('textbox', { name: /新增待辦事項/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /新增待辦事項/i })).toBeInTheDocument();
    });

    it('renders with custom placeholder', () => {
      const customPlaceholder = '輸入您的任務...';
      render(<TodoForm placeholder={customPlaceholder} />, { wrapper: TestWrapper });
      
      expect(screen.getByPlaceholderText(customPlaceholder)).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const customClass = 'custom-form-class';
      const { container } = render(<TodoForm className={customClass} />, { wrapper: TestWrapper });
      
      expect(container.firstChild).toHaveClass('todo-form-container', customClass);
    });

    it('submit button is initially disabled when input is empty', () => {
      render(<TodoForm />, { wrapper: TestWrapper });
      
      const submitButton = screen.getByRole('button', { name: /新增待辦事項/i });
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Input Handling', () => {
    it('enables submit button when input has content', async () => {
      const user = userEvent.setup();
      render(<TodoForm />, { wrapper: TestWrapper });
      
      const input = screen.getByRole('textbox', { name: /新增待辦事項/i });
      const submitButton = screen.getByRole('button', { name: /新增待辦事項/i });
      
      await user.type(input, '測試任務');
      
      expect(submitButton).not.toBeDisabled();
    });

    it('updates input value when typing', async () => {
      const user = userEvent.setup();
      render(<TodoForm />, { wrapper: TestWrapper });
      
      const input = screen.getByRole('textbox', { name: /新增待辦事項/i });
      
      await user.type(input, '新的待辦事項');
      
      expect(input).toHaveValue('新的待辦事項');
    });

    it('clears error when user starts typing', async () => {
      const user = userEvent.setup();
      render(<TodoForm />, { wrapper: TestWrapper });
      
      const input = screen.getByRole('textbox', { name: /新增待辦事項/i });
      const form = screen.getByRole('textbox').closest('form')!;
      
      // Submit empty form to trigger error
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(screen.getByText('請輸入待辦事項內容')).toBeInTheDocument();
      });
      
      // Start typing to clear error
      await user.type(input, '測試');
      
      expect(screen.queryByText('請輸入待辦事項內容')).not.toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('submits form with valid input', async () => {
      const user = userEvent.setup();
      const onTodoAdded = jest.fn();
      render(<TodoForm onTodoAdded={onTodoAdded} />, { wrapper: TestWrapper });
      
      const input = screen.getByRole('textbox', { name: /新增待辦事項/i });
      const submitButton = screen.getByRole('button', { name: /新增待辦事項/i });
      
      await user.type(input, '新的待辦事項');
      await user.click(submitButton);
      
      expect(mockAddTodo).toHaveBeenCalledWith('新的待辦事項');
      expect(onTodoAdded).toHaveBeenCalledWith('新的待辦事項');
    });

    it('clears input after successful submission', async () => {
      const user = userEvent.setup();
      render(<TodoForm />, { wrapper: TestWrapper });
      
      const input = screen.getByRole('textbox', { name: /新增待辦事項/i });
      const submitButton = screen.getByRole('button', { name: /新增待辦事項/i });
      
      await user.type(input, '測試任務');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(input).toHaveValue('');
      });
    });

    it('handles Enter key submission', async () => {
      const user = userEvent.setup();
      render(<TodoForm />, { wrapper: TestWrapper });
      
      const input = screen.getByRole('textbox', { name: /新增待辦事項/i });
      
      await user.type(input, '測試任務');
      await user.keyboard('{Enter}');
      
      expect(mockAddTodo).toHaveBeenCalledWith('測試任務');
    });

    it('prevents submission when already submitting', async () => {
      const user = userEvent.setup();
      // Mock addTodo to simulate async operation
      mockAddTodo.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      render(<TodoForm />, { wrapper: TestWrapper });
      
      const input = screen.getByRole('textbox', { name: /新增待辦事項/i });
      const submitButton = screen.getByRole('button', { name: /新增待辦事項/i });
      
      await user.type(input, '測試任務');
      
      // Start first submission
      await user.click(submitButton);
      
      // Try to submit again immediately
      await user.click(submitButton);
      
      // Should only be called once
      expect(mockAddTodo).toHaveBeenCalledTimes(1);
    });
  });

  describe('Validation', () => {
    it('shows error for empty input submission', async () => {
      render(<TodoForm />, { wrapper: TestWrapper });
      
      const form = screen.getByRole('textbox').closest('form')!;
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(screen.getByText('請輸入待辦事項內容')).toBeInTheDocument();
      });
      
      expect(mockAddTodo).not.toHaveBeenCalled();
    });

    it('shows error for whitespace-only input', async () => {
      const user = userEvent.setup();
      render(<TodoForm />, { wrapper: TestWrapper });
      
      const input = screen.getByRole('textbox', { name: /新增待辦事項/i });
      const form = input.closest('form')!;
      
      await user.type(input, '   ');
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(screen.getByText('請輸入待辦事項內容')).toBeInTheDocument();
      });
      
      expect(mockAddTodo).not.toHaveBeenCalled();
    });

    it('shows error for input exceeding 200 characters', async () => {
      render(<TodoForm />, { wrapper: TestWrapper });
      
      const input = screen.getByRole('textbox', { name: /新增待辦事項/i });
      const form = input.closest('form')!;
      
      // Manually set the input value to exceed maxLength (simulating paste operation)
      const longText = 'a'.repeat(201);
      fireEvent.change(input, { target: { value: longText } });
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(screen.getByText('待辦事項內容不能超過 200 個字元')).toBeInTheDocument();
      });
      
      expect(mockAddTodo).not.toHaveBeenCalled();
    });

    it('applies error styling to input when validation fails', async () => {
      render(<TodoForm />, { wrapper: TestWrapper });
      
      const input = screen.getByRole('textbox', { name: /新增待辦事項/i });
      const form = input.closest('form')!;
      
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(input).toHaveClass('todo-form-input--error');
      });
    });
  });

  describe('Error Handling', () => {
    it('displays error when addTodo throws an error', async () => {
      const user = userEvent.setup();
      const errorMessage = '新增失敗';
      mockAddTodo.mockRejectedValue(new Error(errorMessage));
      
      render(<TodoForm />, { wrapper: TestWrapper });
      
      const input = screen.getByRole('textbox', { name: /新增待辦事項/i });
      const submitButton = screen.getByRole('button', { name: /新增待辦事項/i });
      
      await user.type(input, '測試任務');
      
      await act(async () => {
        await user.click(submitButton);
      });
      
      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('handles non-Error exceptions', async () => {
      const user = userEvent.setup();
      mockAddTodo.mockRejectedValue('字串錯誤');
      
      render(<TodoForm />, { wrapper: TestWrapper });
      
      const input = screen.getByRole('textbox', { name: /新增待辦事項/i });
      const submitButton = screen.getByRole('button', { name: /新增待辦事項/i });
      
      await user.type(input, '測試任務');
      
      await act(async () => {
        await user.click(submitButton);
      });
      
      await waitFor(() => {
        expect(screen.getByText('新增待辦事項時發生錯誤')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<TodoForm />, { wrapper: TestWrapper });
      
      const input = screen.getByRole('textbox', { name: /新增待辦事項/i });
      const submitButton = screen.getByRole('button', { name: /新增待辦事項/i });
      
      expect(input).toHaveAttribute('aria-label', '新增待辦事項');
      expect(submitButton).toHaveAttribute('aria-label', '新增待辦事項');
    });

    it('associates error message with input using aria-describedby', async () => {
      render(<TodoForm />, { wrapper: TestWrapper });
      
      const input = screen.getByRole('textbox', { name: /新增待辦事項/i });
      const form = input.closest('form')!;
      
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(input).toHaveAttribute('aria-describedby', 'todo-form-error');
        expect(screen.getByRole('alert')).toHaveAttribute('id', 'todo-form-error');
      });
    });

    it('error message has proper ARIA attributes', async () => {
      render(<TodoForm />, { wrapper: TestWrapper });
      
      const form = screen.getByRole('textbox').closest('form')!;
      fireEvent.submit(form);
      
      await waitFor(() => {
        const errorElement = screen.getByRole('alert');
        expect(errorElement).toHaveAttribute('aria-live', 'polite');
      });
    });
  });

  describe('Loading State', () => {
    it('shows loading state during submission', async () => {
      const user = userEvent.setup();
      let resolvePromise: () => void;
      
      // Mock addTodo to simulate async operation that we can control
      mockAddTodo.mockImplementation(() => new Promise<void>(resolve => {
        resolvePromise = resolve;
      }));
      
      render(<TodoForm />, { wrapper: TestWrapper });
      
      const input = screen.getByRole('textbox', { name: /新增待辦事項/i });
      const submitButton = screen.getByRole('button', { name: /新增待辦事項/i });
      
      await user.type(input, '測試任務');
      
      // Start the submission but don't await it
      const submitPromise = user.click(submitButton);
      
      // Check loading state immediately
      await waitFor(() => {
        expect(screen.getByText('新增中...')).toBeInTheDocument();
        expect(input).toBeDisabled();
        expect(submitButton).toBeDisabled();
      });
      
      // Resolve the promise to complete the submission
      act(() => {
        resolvePromise!();
      });
      
      // Wait for the submission to complete
      await submitPromise;
    });
  });
});