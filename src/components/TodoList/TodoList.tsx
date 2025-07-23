import React, { memo } from 'react';
import { useTodos } from '../../hooks/useTodos';
import { TodoItem } from '../TodoItem';
import './TodoList.css';

/**
 * TodoList component props
 */
export interface TodoListProps {
  className?: string;
}

/**
 * TodoList container component
 * Renders the list of filtered todos with empty state handling
 * Optimized with React.memo to prevent unnecessary re-renders
 */
const TodoListComponent: React.FC<TodoListProps> = ({ className = '' }) => {
  const { filteredTodos, filter } = useTodos();

  // Handle empty state
  if (filteredTodos.length === 0) {
    let emptyMessage = '沒有待辦事項';
    
    if (filter === 'active') {
      emptyMessage = '沒有未完成的待辦事項';
    } else if (filter === 'completed') {
      emptyMessage = '沒有已完成的待辦事項';
    }

    return (
      <div className={`todo-list empty ${className}`} data-testid="todo-list-empty">
        <div className="empty-state">
          <p className="empty-message">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`todo-list ${className}`} data-testid="todo-list">
      <div className="todo-list-header">
        <span className="todo-count">
          {filteredTodos.length} 個
          {filter === 'all' && '待辦事項'}
          {filter === 'active' && '未完成事項'}
          {filter === 'completed' && '已完成事項'}
        </span>
      </div>
      
      <div className="todo-list-content">
        {filteredTodos.map((todo) => (
          <TodoItem key={todo.id} todo={todo} />
        ))}
      </div>
    </div>
  );
};

/**
 * Memoized TodoList component
 * Only re-renders when className prop changes
 */
export const TodoList = memo(TodoListComponent);

export default TodoList;