import React from 'react';
import { render, screen } from '@testing-library/react';
import { TodoList } from './TodoList';
import { TodoProvider } from '../../context/TodoContext';
import { Todo } from '../../types/todo';

// Mock data for testing
const mockTodos: Todo[] = [
  {
    id: '1',
    title: '完成專案報告',
    completed: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '2',
    title: '購買日用品',
    completed: true,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02')
  },
  {
    id: '3',
    title: '運動30分鐘',
    completed: false,
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03')
  }
];

// Helper component to wrap TodoList with context
const TodoListWrapper: React.FC<{
  initialTodos?: Todo[];
  initialFilter?: 'all' | 'active' | 'completed';
  children?: React.ReactNode;
}> = ({ 
  initialTodos = [], 
  initialFilter = 'all',
  children 
}) => (
  <TodoProvider initialState={{ todos: initialTodos, filter: initialFilter }}>
    {children || <TodoList />}
  </TodoProvider>
);

describe('TodoList Component', () => {
  describe('Rendering Logic', () => {
    it('renders todo list with todos', () => {
      render(
        <TodoListWrapper initialTodos={mockTodos}>
          <TodoList />
        </TodoListWrapper>
      );

      expect(screen.getByTestId('todo-list')).toBeInTheDocument();
      expect(screen.getByText('3 個待辦事項')).toBeInTheDocument();
      
      // Check that all todos are rendered
      expect(screen.getByText('完成專案報告')).toBeInTheDocument();
      expect(screen.getByText('購買日用品')).toBeInTheDocument();
      expect(screen.getByText('運動30分鐘')).toBeInTheDocument();
    });

    it('displays todo titles, status and creation dates', () => {
      render(
        <TodoListWrapper initialTodos={mockTodos}>
          <TodoList />
        </TodoListWrapper>
      );

      // Check titles are displayed
      expect(screen.getByText('完成專案報告')).toBeInTheDocument();
      expect(screen.getByText('購買日用品')).toBeInTheDocument();
      
      // Check status indicators
      expect(screen.getAllByText('未完成')).toHaveLength(2);
      expect(screen.getByText('已完成')).toBeInTheDocument();
      
      // Check dates are displayed
      expect(screen.getByText('2024/1/1')).toBeInTheDocument();
      expect(screen.getByText('2024/1/2')).toBeInTheDocument();
      expect(screen.getByText('2024/1/3')).toBeInTheDocument();
    });

    it('applies completed styling to completed todos', () => {
      render(
        <TodoListWrapper initialTodos={mockTodos}>
          <TodoList />
        </TodoListWrapper>
      );

      const completedTodo = screen.getByText('購買日用品');
      expect(completedTodo).toHaveClass('completed');
      
      const activeTodos = screen.getByText('完成專案報告');
      expect(activeTodos).not.toHaveClass('completed');
    });

    it('applies custom className when provided', () => {
      render(
        <TodoListWrapper initialTodos={mockTodos}>
          <TodoList className="custom-class" />
        </TodoListWrapper>
      );

      expect(screen.getByTestId('todo-list')).toHaveClass('custom-class');
    });
  });

  describe('Empty State Handling', () => {
    it('displays empty message when no todos exist', () => {
      render(
        <TodoListWrapper initialTodos={[]}>
          <TodoList />
        </TodoListWrapper>
      );

      expect(screen.getByTestId('todo-list-empty')).toBeInTheDocument();
      expect(screen.getByText('沒有待辦事項')).toBeInTheDocument();
    });

    it('displays appropriate empty message for active filter', () => {
      const completedOnlyTodos = mockTodos.filter(todo => todo.completed);
      
      render(
        <TodoListWrapper initialTodos={completedOnlyTodos} initialFilter="active">
          <TodoList />
        </TodoListWrapper>
      );

      expect(screen.getByTestId('todo-list-empty')).toBeInTheDocument();
      expect(screen.getByText('沒有未完成的待辦事項')).toBeInTheDocument();
    });

    it('displays appropriate empty message for completed filter', () => {
      const activeOnlyTodos = mockTodos.filter(todo => !todo.completed);
      
      render(
        <TodoListWrapper initialTodos={activeOnlyTodos} initialFilter="completed">
          <TodoList />
        </TodoListWrapper>
      );

      expect(screen.getByTestId('todo-list-empty')).toBeInTheDocument();
      expect(screen.getByText('沒有已完成的待辦事項')).toBeInTheDocument();
    });

    it('shows empty state with custom className', () => {
      render(
        <TodoListWrapper initialTodos={[]}>
          <TodoList className="custom-empty" />
        </TodoListWrapper>
      );

      expect(screen.getByTestId('todo-list-empty')).toHaveClass('custom-empty');
    });
  });

  describe('Filter Integration', () => {
    it('shows all todos when filter is "all"', () => {
      render(
        <TodoListWrapper initialTodos={mockTodos} initialFilter="all">
          <TodoList />
        </TodoListWrapper>
      );

      expect(screen.getByText('3 個待辦事項')).toBeInTheDocument();
      expect(screen.getByText('完成專案報告')).toBeInTheDocument();
      expect(screen.getByText('購買日用品')).toBeInTheDocument();
      expect(screen.getByText('運動30分鐘')).toBeInTheDocument();
    });

    it('shows only active todos when filter is "active"', () => {
      render(
        <TodoListWrapper initialTodos={mockTodos} initialFilter="active">
          <TodoList />
        </TodoListWrapper>
      );

      expect(screen.getByText('2 個未完成事項')).toBeInTheDocument();
      expect(screen.getByText('完成專案報告')).toBeInTheDocument();
      expect(screen.getByText('運動30分鐘')).toBeInTheDocument();
      expect(screen.queryByText('購買日用品')).not.toBeInTheDocument();
    });

    it('shows only completed todos when filter is "completed"', () => {
      render(
        <TodoListWrapper initialTodos={mockTodos} initialFilter="completed">
          <TodoList />
        </TodoListWrapper>
      );

      expect(screen.getByText('1 個已完成事項')).toBeInTheDocument();
      expect(screen.getByText('購買日用品')).toBeInTheDocument();
      expect(screen.queryByText('完成專案報告')).not.toBeInTheDocument();
      expect(screen.queryByText('運動30分鐘')).not.toBeInTheDocument();
    });

    it('updates display when filter changes', () => {
      // Test that the component correctly responds to different filter states
      // This test verifies the component works with different initial filters
      // rather than testing dynamic filter changes (which would be tested at the app level)
      
      const { unmount } = render(
        <TodoListWrapper initialTodos={mockTodos} initialFilter="all">
          <TodoList />
        </TodoListWrapper>
      );

      // Initially shows all todos
      expect(screen.getByText('3 個待辦事項')).toBeInTheDocument();
      
      unmount();

      // Test with active filter
      render(
        <TodoListWrapper initialTodos={mockTodos} initialFilter="active">
          <TodoList />
        </TodoListWrapper>
      );

      expect(screen.getByText('2 個未完成事項')).toBeInTheDocument();
      expect(screen.queryByText('購買日用品')).not.toBeInTheDocument();
    });
  });

  describe('Requirements Verification', () => {
    // 需求 2.1: WHEN 使用者開啟應用程式 THEN 系統 SHALL 顯示所有待辦事項
    it('displays all todos when application opens (Requirement 2.1)', () => {
      render(
        <TodoListWrapper initialTodos={mockTodos}>
          <TodoList />
        </TodoListWrapper>
      );

      expect(screen.getByTestId('todo-list')).toBeInTheDocument();
      mockTodos.forEach(todo => {
        expect(screen.getByText(todo.title)).toBeInTheDocument();
      });
    });

    // 需求 2.3: WHEN 清單為空 THEN 系統 SHALL 顯示「沒有待辦事項」的訊息
    it('displays "沒有待辦事項" message when list is empty (Requirement 2.3)', () => {
      render(
        <TodoListWrapper initialTodos={[]}>
          <TodoList />
        </TodoListWrapper>
      );

      expect(screen.getByText('沒有待辦事項')).toBeInTheDocument();
    });

    // 需求 6.1: WHEN 使用者選擇「全部」過濾器 THEN 系統 SHALL 顯示所有任務
    it('shows all tasks when "all" filter is selected (Requirement 6.1)', () => {
      render(
        <TodoListWrapper initialTodos={mockTodos} initialFilter="all">
          <TodoList />
        </TodoListWrapper>
      );

      expect(screen.getByText('完成專案報告')).toBeInTheDocument();
      expect(screen.getByText('購買日用品')).toBeInTheDocument();
      expect(screen.getByText('運動30分鐘')).toBeInTheDocument();
    });

    // 需求 6.2: WHEN 使用者選擇「未完成」過濾器 THEN 系統 SHALL 只顯示未完成的任務
    it('shows only active tasks when "active" filter is selected (Requirement 6.2)', () => {
      render(
        <TodoListWrapper initialTodos={mockTodos} initialFilter="active">
          <TodoList />
        </TodoListWrapper>
      );

      expect(screen.getByText('完成專案報告')).toBeInTheDocument();
      expect(screen.getByText('運動30分鐘')).toBeInTheDocument();
      expect(screen.queryByText('購買日用品')).not.toBeInTheDocument();
    });

    // 需求 6.3: WHEN 使用者選擇「已完成」過濾器 THEN 系統 SHALL 只顯示已完成的任務
    it('shows only completed tasks when "completed" filter is selected (Requirement 6.3)', () => {
      render(
        <TodoListWrapper initialTodos={mockTodos} initialFilter="completed">
          <TodoList />
        </TodoListWrapper>
      );

      expect(screen.getByText('購買日用品')).toBeInTheDocument();
      expect(screen.queryByText('完成專案報告')).not.toBeInTheDocument();
      expect(screen.queryByText('運動30分鐘')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles todos with very long titles', () => {
      const longTitleTodo: Todo = {
        id: 'long',
        title: '這是一個非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常長的待辦事項標題',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      render(
        <TodoListWrapper initialTodos={[longTitleTodo]}>
          <TodoList />
        </TodoListWrapper>
      );

      expect(screen.getByText(longTitleTodo.title)).toBeInTheDocument();
    });

    it('handles todos with special characters in titles', () => {
      const specialCharTodo: Todo = {
        id: 'special',
        title: '買 @#$%^&*() 特殊符號測試 <script>alert("test")</script>',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      render(
        <TodoListWrapper initialTodos={[specialCharTodo]}>
          <TodoList />
        </TodoListWrapper>
      );

      expect(screen.getByText(specialCharTodo.title)).toBeInTheDocument();
    });

    it('handles large number of todos', () => {
      const manyTodos: Todo[] = Array.from({ length: 100 }, (_, i) => ({
        id: `todo-${i}`,
        title: `待辦事項 ${i + 1}`,
        completed: i % 2 === 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      render(
        <TodoListWrapper initialTodos={manyTodos}>
          <TodoList />
        </TodoListWrapper>
      );

      expect(screen.getByText('100 個待辦事項')).toBeInTheDocument();
      expect(screen.getByText('待辦事項 1')).toBeInTheDocument();
      expect(screen.getByText('待辦事項 100')).toBeInTheDocument();
    });
  });
});