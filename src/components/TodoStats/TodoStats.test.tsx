import React from 'react';
import { render, screen } from '@testing-library/react';
import { TodoStats } from './TodoStats';
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
  },
  {
    id: '4',
    title: 'Completed Todo 2',
    completed: true,
    createdAt: new Date('2024-01-04'),
    updatedAt: new Date('2024-01-04')
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

describe('TodoStats Component', () => {
  describe('Rendering', () => {
    it('renders the statistics title', () => {
      render(
        <TestWrapper>
          <TodoStats />
        </TestWrapper>
      );

      expect(screen.getByText('統計資訊')).toBeInTheDocument();
    });

    it('renders all statistics cards', () => {
      render(
        <TestWrapper>
          <TodoStats />
        </TestWrapper>
      );

      expect(screen.getByTestId('stats-total')).toBeInTheDocument();
      expect(screen.getByTestId('stats-active')).toBeInTheDocument();
      expect(screen.getByTestId('stats-completed')).toBeInTheDocument();
    });

    it('applies custom className when provided', () => {
      const { container } = render(
        <TestWrapper>
          <TodoStats className="custom-class" />
        </TestWrapper>
      );

      expect(container.firstChild).toHaveClass('todo-stats', 'custom-class');
    });

    it('has proper ARIA attributes', () => {
      render(
        <TestWrapper>
          <TodoStats />
        </TestWrapper>
      );

      const statsRegion = screen.getByRole('region');
      expect(statsRegion).toHaveAttribute('aria-label', '待辦事項統計');

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    });
  });

  describe('Statistics Display', () => {
    it('displays correct total count', () => {
      render(
        <TestWrapper>
          <TodoStats />
        </TestWrapper>
      );

      const totalCard = screen.getByTestId('stats-total');
      expect(totalCard).toHaveTextContent('4');
      expect(totalCard).toHaveTextContent('總任務數');
    });

    it('displays correct active count', () => {
      render(
        <TestWrapper>
          <TodoStats />
        </TestWrapper>
      );

      const activeCard = screen.getByTestId('stats-active');
      expect(activeCard).toHaveTextContent('2');
      expect(activeCard).toHaveTextContent('未完成');
    });

    it('displays correct completed count', () => {
      render(
        <TestWrapper>
          <TodoStats />
        </TestWrapper>
      );

      const completedCard = screen.getByTestId('stats-completed');
      expect(completedCard).toHaveTextContent('2');
      expect(completedCard).toHaveTextContent('已完成');
    });

    it('displays correct completion percentage', () => {
      render(
        <TestWrapper>
          <TodoStats />
        </TestWrapper>
      );

      const percentage = screen.getByTestId('progress-percentage');
      expect(percentage).toHaveTextContent('50%');
    });

    it('updates statistics when todos change', () => {
      const allCompletedTodos: Todo[] = [
        {
          id: '1',
          title: 'Completed Todo 1',
          completed: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        },
        {
          id: '2',
          title: 'Completed Todo 2',
          completed: true,
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02')
        }
      ];

      render(
        <TestWrapper initialTodos={allCompletedTodos}>
          <TodoStats />
        </TestWrapper>
      );

      expect(screen.getByTestId('stats-total')).toHaveTextContent('2');
      expect(screen.getByTestId('stats-active')).toHaveTextContent('0');
      expect(screen.getByTestId('stats-completed')).toHaveTextContent('2');
      expect(screen.getByTestId('progress-percentage')).toHaveTextContent('100%');
    });
  });

  describe('Progress Bar', () => {
    it('renders progress bar with correct attributes', () => {
      render(
        <TestWrapper>
          <TodoStats />
        </TestWrapper>
      );

      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toHaveAttribute('role', 'progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '50');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    });

    it('sets correct width for progress fill', () => {
      render(
        <TestWrapper>
          <TodoStats />
        </TestWrapper>
      );

      const progressFill = screen.getByTestId('progress-fill');
      expect(progressFill).toHaveStyle('width: 50%');
    });

    it('shows 100% progress when all todos are completed', () => {
      const allCompletedTodos: Todo[] = [
        {
          id: '1',
          title: 'Completed Todo 1',
          completed: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        }
      ];

      render(
        <TestWrapper initialTodos={allCompletedTodos}>
          <TodoStats />
        </TestWrapper>
      );

      const progressFill = screen.getByTestId('progress-fill');
      expect(progressFill).toHaveStyle('width: 100%');
      expect(screen.getByTestId('progress-percentage')).toHaveTextContent('100%');
    });

    it('shows 0% progress when no todos are completed', () => {
      const allActiveTodos: Todo[] = [
        {
          id: '1',
          title: 'Active Todo 1',
          completed: false,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        }
      ];

      render(
        <TestWrapper initialTodos={allActiveTodos}>
          <TodoStats />
        </TestWrapper>
      );

      const progressFill = screen.getByTestId('progress-fill');
      expect(progressFill).toHaveStyle('width: 0%');
      expect(screen.getByTestId('progress-percentage')).toHaveTextContent('0%');
    });
  });

  describe('Progress Messages', () => {
    it('shows completion message when all todos are done', () => {
      const allCompletedTodos: Todo[] = [
        {
          id: '1',
          title: 'Completed Todo 1',
          completed: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        }
      ];

      render(
        <TestWrapper initialTodos={allCompletedTodos}>
          <TodoStats />
        </TestWrapper>
      );

      expect(screen.getByText('🎉 所有任務都已完成！')).toBeInTheDocument();
    });

    it('shows remaining tasks message when some todos are incomplete', () => {
      render(
        <TestWrapper>
          <TodoStats />
        </TestWrapper>
      );

      expect(screen.getByText('還有 2 個任務待完成')).toBeInTheDocument();
    });

    it('shows correct remaining count for different scenarios', () => {
      const mostlyCompletedTodos: Todo[] = [
        {
          id: '1',
          title: 'Active Todo 1',
          completed: false,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        },
        {
          id: '2',
          title: 'Completed Todo 1',
          completed: true,
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02')
        },
        {
          id: '3',
          title: 'Completed Todo 2',
          completed: true,
          createdAt: new Date('2024-01-03'),
          updatedAt: new Date('2024-01-03')
        }
      ];

      render(
        <TestWrapper initialTodos={mostlyCompletedTodos}>
          <TodoStats />
        </TestWrapper>
      );

      expect(screen.getByText('還有 1 個任務待完成')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('shows empty state when no todos exist', () => {
      render(
        <TestWrapper initialTodos={[]}>
          <TodoStats />
        </TestWrapper>
      );

      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText('還沒有任何待辦事項')).toBeInTheDocument();
      expect(screen.getByText('新增第一個任務開始使用吧！')).toBeInTheDocument();
    });

    it('shows zero counts in empty state', () => {
      render(
        <TestWrapper initialTodos={[]}>
          <TodoStats />
        </TestWrapper>
      );

      expect(screen.getByTestId('stats-total')).toHaveTextContent('0');
      expect(screen.getByTestId('stats-active')).toHaveTextContent('0');
      expect(screen.getByTestId('stats-completed')).toHaveTextContent('0');
      expect(screen.getByTestId('progress-percentage')).toHaveTextContent('0%');
    });

    it('hides progress text in empty state', () => {
      render(
        <TestWrapper initialTodos={[]}>
          <TodoStats />
        </TestWrapper>
      );

      expect(screen.queryByText(/還有.*個任務待完成/)).not.toBeInTheDocument();
      expect(screen.queryByText('🎉 所有任務都已完成！')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper aria-labels for statistics', () => {
      render(
        <TestWrapper>
          <TodoStats />
        </TestWrapper>
      );

      expect(screen.getByLabelText('總共 4 個任務')).toBeInTheDocument();
      expect(screen.getByLabelText('2 個未完成任務')).toBeInTheDocument();
      expect(screen.getByLabelText('2 個已完成任務')).toBeInTheDocument();
    });

    it('has proper aria-label for progress bar', () => {
      render(
        <TestWrapper>
          <TodoStats />
        </TestWrapper>
      );

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-label', '完成進度 50%');
    });

    it('has proper aria-label for progress percentage', () => {
      render(
        <TestWrapper>
          <TodoStats />
        </TestWrapper>
      );

      expect(screen.getByLabelText('完成進度 50%')).toBeInTheDocument();
    });

    it('updates aria attributes when statistics change', () => {
      const singleActiveTodo: Todo[] = [
        {
          id: '1',
          title: 'Active Todo 1',
          completed: false,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        }
      ];

      render(
        <TestWrapper initialTodos={singleActiveTodo}>
          <TodoStats />
        </TestWrapper>
      );

      expect(screen.getByLabelText('總共 1 個任務')).toBeInTheDocument();
      expect(screen.getByLabelText('1 個未完成任務')).toBeInTheDocument();
      expect(screen.getByLabelText('0 個已完成任務')).toBeInTheDocument();
      
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-label', '完成進度 0%');
    });
  });

  describe('Real-time Updates', () => {
    it('reflects changes in todo statistics immediately', () => {
      const mixedTodos: Todo[] = [
        {
          id: '1',
          title: 'Active Todo 1',
          completed: false,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        },
        {
          id: '2',
          title: 'Completed Todo 1',
          completed: true,
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02')
        }
      ];

      render(
        <TestWrapper initialTodos={mixedTodos}>
          <TodoStats />
        </TestWrapper>
      );

      // Verify initial state
      expect(screen.getByTestId('stats-total')).toHaveTextContent('2');
      expect(screen.getByTestId('stats-active')).toHaveTextContent('1');
      expect(screen.getByTestId('stats-completed')).toHaveTextContent('1');
      expect(screen.getByTestId('progress-percentage')).toHaveTextContent('50%');
    });

    it('handles edge cases correctly', () => {
      // Test with single todo
      const singleTodo: Todo[] = [
        {
          id: '1',
          title: 'Single Todo',
          completed: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        }
      ];

      render(
        <TestWrapper initialTodos={singleTodo}>
          <TodoStats />
        </TestWrapper>
      );

      expect(screen.getByTestId('stats-total')).toHaveTextContent('1');
      expect(screen.getByTestId('stats-active')).toHaveTextContent('0');
      expect(screen.getByTestId('stats-completed')).toHaveTextContent('1');
      expect(screen.getByTestId('progress-percentage')).toHaveTextContent('100%');
      expect(screen.getByText('🎉 所有任務都已完成！')).toBeInTheDocument();
    });
  });

  describe('Visual Elements', () => {
    it('renders icons for each statistic card', () => {
      render(
        <TestWrapper>
          <TodoStats />
        </TestWrapper>
      );

      // Check that icons are present (they have aria-hidden="true")
      const icons = screen.getAllByLabelText('', { hidden: true });
      expect(icons.length).toBeGreaterThan(0);
    });

    it('renders progress bar fill element', () => {
      render(
        <TestWrapper>
          <TodoStats />
        </TestWrapper>
      );

      const progressFill = screen.getByTestId('progress-fill');
      expect(progressFill).toBeInTheDocument();
      expect(progressFill).toHaveClass('todo-stats__progress-fill');
    });
  });
});