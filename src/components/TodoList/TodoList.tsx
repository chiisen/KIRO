import React from 'react';
import { useTodos } from '../../hooks/useTodos';
import { Todo } from '../../types/todo';
import './TodoList.css';

/**
 * TodoList component props
 */
export interface TodoListProps {
  className?: string;
}

/**
 * Temporary TodoItem component until the actual one is implemented
 * This will be replaced when task 5.1 is completed
 */
const TemporaryTodoItem: React.FC<{ todo: Todo }> = ({ todo }) => (
  <div className="todo-item" data-testid={`todo-item-${todo.id}`}>
    <span className={`todo-title ${todo.completed ? 'completed' : ''}`}>
      {todo.title}
    </span>
    <span className="todo-status">
      {todo.completed ? '已完成' : '未完成'}
    </span>
    <span className="todo-date">
      {todo.createdAt.toLocaleDateString()}
    </span>
  </div>
);

/**
 * TodoList container component
 * Renders the list of filtered todos with empty state handling
 */
export const TodoList: React.FC<TodoListProps> = ({ className = '' }) => {
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
          <TemporaryTodoItem key={todo.id} todo={todo} />
        ))}
      </div>
    </div>
  );
};

export default TodoList;