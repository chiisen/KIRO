import React, { memo } from 'react';
import { FilterType } from '../../types/todo';
import { useTodos } from '../../hooks/useTodos';
import './TodoFilter.css';

/**
 * Props for TodoFilter component
 */
export interface TodoFilterProps {
  className?: string;
}

/**
 * Filter button configuration
 */
interface FilterButton {
  key: FilterType;
  label: string;
  title: string;
}

const FILTER_BUTTONS: FilterButton[] = [
  { key: 'all', label: '全部', title: '顯示所有待辦事項' },
  { key: 'active', label: '未完成', title: '顯示未完成的待辦事項' },
  { key: 'completed', label: '已完成', title: '顯示已完成的待辦事項' }
];

/**
 * TodoFilter component for filtering todos by status
 * Provides buttons to switch between all, active, and completed todos
 * Optimized with React.memo to prevent unnecessary re-renders
 */
const TodoFilterComponent: React.FC<TodoFilterProps> = ({ className = '' }) => {
  const { filter, setFilter, stats } = useTodos();

  const handleFilterChange = (newFilter: FilterType) => {
    try {
      setFilter(newFilter);
    } catch (error) {
      console.error('Failed to change filter:', error);
    }
  };

  const getFilterCount = (filterType: FilterType): number => {
    switch (filterType) {
      case 'all':
        return stats.total;
      case 'active':
        return stats.active;
      case 'completed':
        return stats.completed;
      default:
        return 0;
    }
  };

  return (
    <div className={`todo-filter ${className}`} role="tablist" aria-label="過濾待辦事項">
      {FILTER_BUTTONS.map((button) => {
        const isActive = filter === button.key;
        const count = getFilterCount(button.key);
        
        return (
          <button
            key={button.key}
            type="button"
            className={`todo-filter__button ${isActive ? 'todo-filter__button--active' : ''}`}
            onClick={() => handleFilterChange(button.key)}
            title={button.title}
            role="tab"
            aria-selected={isActive}
            aria-controls="todo-list"
            data-testid={`filter-${button.key}`}
          >
            <span className="todo-filter__label">{button.label}</span>
            <span className="todo-filter__count" aria-label={`${count} 個項目`}>
              ({count})
            </span>
          </button>
        );
      })}
    </div>
  );
};

/**
 * Memoized TodoFilter component
 * Only re-renders when className prop changes
 */
export const TodoFilter = memo(TodoFilterComponent);

export default TodoFilter;