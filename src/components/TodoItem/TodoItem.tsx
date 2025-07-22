import React, { useState, useRef, useEffect } from 'react';
import { Todo } from '../../types/todo';
import { useTodos } from '../../hooks/useTodos';
import './TodoItem.css';

interface TodoItemProps {
  todo: Todo;
}

/**
 * TodoItem component for displaying and managing individual todo items
 * Handles display of title, status, timestamps, completion toggle, and inline editing
 */
export function TodoItem({ todo }: TodoItemProps) {
  const { toggleTodo, updateTodo, deleteTodo } = useTodos();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(todo.title);
  const [editError, setEditError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const editInputRef = useRef<HTMLInputElement>(null);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [isEditing]);

  // Reset edit value when todo title changes externally
  useEffect(() => {
    setEditValue(todo.title);
  }, [todo.title]);

  const handleToggle = () => {
    try {
      toggleTodo(todo.id);
    } catch (error) {
      console.error('Failed to toggle todo:', error);
    }
  };

  const handleDoubleClick = () => {
    if (!todo.completed) { // Don't allow editing completed todos
      setIsEditing(true);
      setEditError(null);
    }
  };

  const handleEditSubmit = () => {
    try {
      // Validate input
      const trimmedValue = editValue.trim();
      
      if (!trimmedValue) {
        setEditError('標題不能為空');
        return;
      }

      if (trimmedValue.length > 200) {
        setEditError('標題不能超過200個字元');
        return;
      }

      // Only update if value actually changed
      if (trimmedValue !== todo.title) {
        updateTodo(todo.id, trimmedValue);
      }

      setIsEditing(false);
      setEditError(null);
    } catch (error) {
      console.error('Failed to update todo:', error);
      setEditError('更新失敗，請重試');
    }
  };

  const handleEditCancel = () => {
    setEditValue(todo.title); // Reset to original value
    setIsEditing(false);
    setEditError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleEditSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleEditCancel();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
    // Clear error when user starts typing
    if (editError) {
      setEditError(null);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    try {
      deleteTodo(todo.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Failed to delete todo:', error);
      setShowDeleteConfirm(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <div className="todo-item-content">
        <label className="todo-checkbox-label">
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={handleToggle}
            className="todo-checkbox"
            aria-label={`標記 "${todo.title}" 為${todo.completed ? '未完成' : '已完成'}`}
          />
          <span className="checkbox-custom"></span>
        </label>
        
        <div className="todo-details">
          {isEditing ? (
            <div className="todo-edit-container">
              <input
                ref={editInputRef}
                type="text"
                value={editValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className={`todo-edit-input ${editError ? 'error' : ''}`}
                placeholder="輸入待辦事項標題..."
                maxLength={200}
                aria-label="編輯待辦事項標題"
              />
              {editError && (
                <span className="edit-error" role="alert">
                  {editError}
                </span>
              )}
              <div className="edit-actions">
                <button
                  type="button"
                  onClick={handleEditSubmit}
                  className="edit-confirm-btn"
                  aria-label="確認編輯"
                  title="確認 (Enter)"
                >
                  ✓
                </button>
                <button
                  type="button"
                  onClick={handleEditCancel}
                  className="edit-cancel-btn"
                  aria-label="取消編輯"
                  title="取消 (Escape)"
                >
                  ✕
                </button>
              </div>
            </div>
          ) : (
            <>
              <span 
                className={`todo-title ${todo.completed ? 'completed-text' : ''} ${!todo.completed ? 'editable' : ''}`}
                onDoubleClick={handleDoubleClick}
                title={!todo.completed ? '雙擊編輯' : ''}
              >
                {todo.title}
              </span>
              
              <div className="todo-timestamps">
                <span className="todo-created">
                  建立於: {formatDate(todo.createdAt)}
                </span>
                {todo.updatedAt.getTime() !== todo.createdAt.getTime() && (
                  <span className="todo-updated">
                    更新於: {formatDate(todo.updatedAt)}
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      
      <div className="todo-actions">
        <div className="todo-status">
          <span className={`status-badge ${todo.completed ? 'status-completed' : 'status-active'}`}>
            {todo.completed ? '已完成' : '未完成'}
          </span>
        </div>
        
        <button
          type="button"
          onClick={handleDeleteClick}
          className="delete-btn"
          aria-label={`刪除 "${todo.title}"`}
          title="刪除待辦事項"
        >
          🗑️
        </button>
      </div>
      
      {showDeleteConfirm && (
        <div className="delete-confirm-overlay">
          <div className="delete-confirm-dialog">
            <h3>確認刪除</h3>
            <p>確定要刪除「{todo.title}」嗎？此操作無法復原。</p>
            <div className="delete-confirm-actions">
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="delete-confirm-btn"
                aria-label="確認刪除"
              >
                確認刪除
              </button>
              <button
                type="button"
                onClick={handleDeleteCancel}
                className="delete-cancel-btn"
                aria-label="取消刪除"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}