import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TodoFilter } from './TodoFilter';
import { TodoProvider } from '../../context/TodoContext';
import { Todo } from '../../types/todo';

// Mock data for testing
const mockTodos: Todo[] = [
  {
    id: '1',
    title: 'Active Todo 1',
    completed: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '2',
    title: 'Active Todo 2',
    completed: false,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02')
  },
  {
    id: '3',
    title: 'Completed Todo 1',
    completed: true,
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03')
  }
];

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode; initialTodos?: Todo[] }> = ({ 
  children, 
  initialTodos = mockTodos 
}) => {
  const initialState = {
    todos: initialTodos,
    filter: 'all' as const
  };
  
  return (
    <TodoProvider initialState={initialState}>
      {children}
    </TodoProvider>
  );
};

describe('TodoFilter Component', () => {
  describe('Rendering', () => {
    it('renders all filter buttons', () => {
      render(
        <TestWrapper>
          <TodoFilter />
        </TestWrapper>
      );

      expect(screen.getByTestId('filter-all')).toBeInTheDocument();
      expect(screen.getByTestId('filter-active')).toBeInTheDocument();
      expect(screen.getByTestId('filter-completed')).toBeInTheDocument();
    });

    it('displays correct button labels', () => {
      render(
        <TestWrapper>
          <TodoFilter />
        </TestWrapper>
      );

      expect(screen.getByText('全部')).toBeInTheDocument();
      expect(screen.getByText('未完成')).toBeInTheDocument();
      expect(screen.getByText('已完成')).toBeInTheDocument();
    });

    it('displays correct counts for each filter', () => {
      render(
        <TestWrapper>
          <TodoFilter />
        </TestWrapper>
      );

      expect(screen.getByText('(3)')).toBeInTheDocument(); // All todos
      expect(screen.getByText('(2)')).toBeInTheDocument(); // Active todos
      expect(screen.getByText('(1)')).toBeInTheDocument(); // Completed todos
    });

    it('applies custom className when provided', () => {
      const { container } = render(
        <TestWrapper>
          <TodoFilter className="custom-class" />
        </TestWrapper>
      );

      expect(container.firstChild).toHaveClass('todo-filter', 'custom-class');
    });
  });

  describe('Filter State and Highlighting', () => {
    it('highlights the "all" filter by default', () => {
      render(
        <TestWrapper>
          <TodoFilter />
        </TestWrapper>
      );

      const allButton = screen.getByTestId('filter-all');
      expect(allButton).toHaveClass('todo-filter__button--active');
      expect(allButton).toHaveAttribute('aria-selected', 'true');
    });

    it('updates highlighting when filter changes', async () => {
      render(
        <TestWrapper>
          <TodoFilter />
        </TestWrapper>
      );

      const activeButton = screen.getByTestId('filter-active');
      const allButton = screen.getByTestId('filter-all');

      // Click active filter
      fireEvent.click(activeButton);

      await waitFor(() => {
        expect(activeButton).toHaveClass('todo-filter__button--active');
        expect(activeButton).toHaveAttribute('aria-selected', 'true');
        expect(allButton).not.toHaveClass('todo-filter__button--active');
        expect(allButton).toHaveAttribute('aria-selected', 'false');
      });
    });

    it('only one filter can be active at a time', async () => {
      render(
        <TestWrapper>
          <TodoFilter />
        </TestWrapper>
      );

      const allButton = screen.getByTestId('filter-all');
      const activeButton = screen.getByTestId('filter-active');
      const completedButton = screen.getByTestId('filter-completed');

      // Click completed filter
      fireEvent.click(completedButton);

      await waitFor(() => {
        expect(completedButton).toHaveClass('todo-filter__button--active');
        expect(allButton).not.toHaveClass('todo-filter__button--active');
        expect(activeButton).not.toHaveClass('todo-filter__button--active');
      });
    });
  });

  describe('Filter Functionality', () => {
    it('switches to active filter when clicked', async () => {
      render(
        <TestWrapper>
          <TodoFilter />
        </TestWrapper>
      );

      const activeButton = screen.getByTestId('filter-active');
      fireEvent.click(activeButton);

      await waitFor(() => {
        expect(activeButton).toHaveClass('todo-filter__button--active');
      });
    });

    it('switches to completed filter when clicked', async () => {
      render(
        <TestWrapper>
          <TodoFilter />
        </TestWrapper>
      );

      const completedButton = screen.getByTestId('filter-completed');
      fireEvent.click(completedButton);

      await waitFor(() => {
        expect(completedButton).toHaveClass('todo-filter__button--active');
      });
    });

    it('switches back to all filter when clicked', async () => {
      render(
        <TestWrapper>
          <TodoFilter />
        </TestWrapper>
      );

      const allButton = screen.getByTestId('filter-all');
      const activeButton = screen.getByTestId('filter-active');

      // First switch to active
      fireEvent.click(activeButton);
      await waitFor(() => {
        expect(activeButton).toHaveClass('todo-filter__button--active');
      });

      // Then switch back to all
      fireEvent.click(allButton);
      await waitFor(() => {
        expect(allButton).toHaveClass('todo-filter__button--active');
      });
    });
  });

  describe('Count Updates', () => {
    it('updates counts when todos change', () => {
      const emptyTodos: Todo[] = [];
      render(
        <TestWrapper initialTodos={emptyTodos}>
          <TodoFilter />
        </TestWrapper>
      );

      // All counts should be 0
      expect(screen.getByText('(0)')).toBeInTheDocument();
    });

    it('displays correct counts with mixed todo states', () => {
      const mixedTodos: Todo[] = [
        ...mockTodos,
        {
          id: '4',
          title: 'Another Active Todo',
          completed: false,
          createdAt: new Date('2024-01-04'),
          updatedAt: new Date('2024-01-04')
        },
        {
          id: '5',
          title: 'Another Completed Todo',
          completed: true,
          createdAt: new Date('2024-01-05'),
          updatedAt: new Date('2024-01-05')
        }
      ];

      render(
        <TestWrapper initialTodos={mixedTodos}>
          <TodoFilter />
        </TestWrapper>
      );

      expect(screen.getByText('(5)')).toBeInTheDocument(); // All todos
      expect(screen.getByText('(3)')).toBeInTheDocument(); // Active todos
      expect(screen.getByText('(2)')).toBeInTheDocument(); // Completed todos
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(
        <TestWrapper>
          <TodoFilter />
        </TestWrapper>
      );

      const filterContainer = screen.getByRole('tablist');
      expect(filterContainer).toHaveAttribute('aria-label', '過濾待辦事項');

      const buttons = screen.getAllByRole('tab');
      expect(buttons).toHaveLength(3);

      buttons.forEach(button => {
        expect(button).toHaveAttribute('aria-selected');
        expect(button).toHaveAttribute('aria-controls', 'todo-list');
      });
    });

    it('has proper titles for accessibility', () => {
      render(
        <TestWrapper>
          <TodoFilter />
        </TestWrapper>
      );

      expect(screen.getByTestId('filter-all')).toHaveAttribute('title', '顯示所有待辦事項');
      expect(screen.getByTestId('filter-active')).toHaveAttribute('title', '顯示未完成的待辦事項');
      expect(screen.getByTestId('filter-completed')).toHaveAttribute('title', '顯示已完成的待辦事項');
    });

    it('has proper aria-label for counts', () => {
      render(
        <TestWrapper>
          <TodoFilter />
        </TestWrapper>
      );

      const countElements = screen.getAllByLabelText(/個項目/);
      expect(countElements).toHaveLength(3);
    });
  });

  describe('Error Handling', () => {
    it('handles filter change errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Mock the useTodos hook to throw an error
      jest.doMock('../../hooks/useTodos', () => ({
        useTodos: () => ({
          filter: 'all',
          setFilter: () => {
            throw new Error('Test error');
          },
          stats: { total: 0, active: 0, completed: 0 }
        })
      }));

      render(
        <TestWrapper>
          <TodoFilter />
        </TestWrapper>
      );

      const activeButton = screen.getByTestId('filter-active');
      fireEvent.click(activeButton);

      expect(consoleSpy).toHaveBeenCalledWith('Failed to change filter:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('Keyboard Navigation', () => {
    it('supports keyboard navigation', () => {
      render(
        <TestWrapper>
          <TodoFilter />
        </TestWrapper>
      );

      const allButton = screen.getByTestId('filter-all');
      const activeButton = screen.getByTestId('filter-active');

      // Focus on all button
      allButton.focus();
      expect(allButton).toHaveFocus();

      // Tab to next button
      fireEvent.keyDown(allButton, { key: 'Tab' });
      activeButton.focus();
      expect(activeButton).toHaveFocus();
    });

    it('activates filter on Enter key', async () => {
      render(
        <TestWrapper>
          <TodoFilter />
        </TestWrapper>
      );

      const activeButton = screen.getByTestId('filter-active');
      activeButton.focus();
      
      fireEvent.keyDown(activeButton, { key: 'Enter' });

      await waitFor(() => {
        expect(activeButton).toHaveClass('todo-filter__button--active');
      });
    });

    it('activates filter on Space key', async () => {
      render(
        <TestWrapper>
          <TodoFilter />
        </TestWrapper>
      );

      const completedButton = screen.getByTestId('filter-completed');
      completedButton.focus();
      
      fireEvent.keyDown(completedButton, { key: ' ' });

      await waitFor(() => {
        expect(completedButton).toHaveClass('todo-filter__button--active');
      });
    });
  });
});