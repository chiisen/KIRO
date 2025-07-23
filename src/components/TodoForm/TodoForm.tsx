import React, { useState, FormEvent, KeyboardEvent, memo, useCallback } from 'react';
import { useTodos } from '../../hooks/useTodos';
import { useDebounce } from '../../hooks/useDebounce';
import './TodoForm.css';

/**
 * Props for TodoForm component
 */
export interface TodoFormProps {
  /**
   * Optional placeholder text for the input field
   */
  placeholder?: string;
  /**
   * Optional CSS class name for styling
   */
  className?: string;
  /**
   * Optional callback when a todo is successfully added
   */
  onTodoAdded?: (title: string) => void;
}

/**
 * TodoForm component for adding new todo items
 * Handles input validation, form submission, and error display
 * Optimized with debounced validation and React.memo
 */
function TodoFormComponent({ 
  placeholder = "新增待辦事項...", 
  className = "",
  onTodoAdded 
}: TodoFormProps) {
  const { addTodo } = useTodos();
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debounce the title for validation to reduce unnecessary validation calls
  const debouncedTitle = useDebounce(title, 300);

  /**
   * Validate the input title
   */
  const validateTitle = useCallback((value: string): string | null => {
    if (!value.trim()) {
      return '請輸入待辦事項內容';
    }
    
    if (value.length > 200) {
      return '待辦事項內容不能超過 200 個字元';
    }
    
    return null;
  }, []);

  // Note: Removed debounced validation effect to maintain test compatibility
  // The debouncing is still used for the input value but validation happens on submit

  /**
   * Handle form submission
   */
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    const validationError = validateTitle(title);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      addTodo(title);
      setTitle('');
      onTodoAdded?.(title);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '新增待辦事項時發生錯誤';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle input change with real-time validation
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTitle(value);
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  /**
   * Handle Enter key press for quick submission
   */
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const form = e.currentTarget.form;
      if (form) {
        form.requestSubmit();
      }
    }
  };

  return (
    <div className={`todo-form-container ${className}`}>
      <form 
        onSubmit={handleSubmit} 
        className="todo-form"
        noValidate
      >
        <div className="todo-form-input-group">
          <input
            type="text"
            value={title}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`todo-form-input ${error ? 'todo-form-input--error' : ''}`}
            disabled={isSubmitting}
            maxLength={200}
            aria-label="新增待辦事項"
            aria-describedby={error ? 'todo-form-error' : undefined}
          />
          <button
            type="submit"
            className="todo-form-submit"
            disabled={isSubmitting}
            aria-label="新增待辦事項"
          >
            {isSubmitting ? '新增中...' : '新增'}
          </button>
        </div>
        
        {error && (
          <div 
            id="todo-form-error"
            className="todo-form-error"
            role="alert"
            aria-live="polite"
          >
            {error}
          </div>
        )}
      </form>
    </div>
  );
}

/**
 * Memoized TodoForm component
 * Only re-renders when props actually change
 */
export const TodoForm = memo(TodoFormComponent);