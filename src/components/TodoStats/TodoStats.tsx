import React, { memo } from 'react';
import { useTodos } from '../../hooks/useTodos';
import './TodoStats.css';

/**
 * Props for TodoStats component
 */
export interface TodoStatsProps {
  className?: string;
}

/**
 * TodoStats component for displaying todo statistics
 * Shows total, completed, and active todo counts with progress visualization
 * Optimized with React.memo to prevent unnecessary re-renders
 */
const TodoStatsComponent: React.FC<TodoStatsProps> = ({ className = '' }) => {
  const { stats } = useTodos();

  const getProgressBarColor = (percentage: number): string => {
    if (percentage === 100) return 'var(--color-success)';
    if (percentage >= 75) return 'var(--color-warning)';
    if (percentage >= 50) return 'var(--color-info)';
    return 'var(--color-primary)';
  };

  const formatPercentage = (percentage: number): string => {
    return `${percentage}%`;
  };

  return (
    <div className={`todo-stats ${className}`} role="region" aria-label="待辦事項統計">
      <div className="todo-stats__header">
        <h2 className="todo-stats__title">統計資訊</h2>
      </div>

      <div className="todo-stats__content">
        {/* Statistics Cards */}
        <div className="todo-stats__cards">
          <div className="todo-stats__card" data-testid="stats-total">
            <div className="todo-stats__card-icon">
              <span className="todo-stats__icon todo-stats__icon--total" aria-hidden="true">📋</span>
            </div>
            <div className="todo-stats__card-content">
              <div className="todo-stats__card-value" aria-label={`總共 ${stats.total} 個任務`}>
                {stats.total}
              </div>
              <div className="todo-stats__card-label">總任務數</div>
            </div>
          </div>

          <div className="todo-stats__card" data-testid="stats-active">
            <div className="todo-stats__card-icon">
              <span className="todo-stats__icon todo-stats__icon--active" aria-hidden="true">⏳</span>
            </div>
            <div className="todo-stats__card-content">
              <div className="todo-stats__card-value" aria-label={`${stats.active} 個未完成任務`}>
                {stats.active}
              </div>
              <div className="todo-stats__card-label">未完成</div>
            </div>
          </div>

          <div className="todo-stats__card" data-testid="stats-completed">
            <div className="todo-stats__card-icon">
              <span className="todo-stats__icon todo-stats__icon--completed" aria-hidden="true">✅</span>
            </div>
            <div className="todo-stats__card-content">
              <div className="todo-stats__card-value" aria-label={`${stats.completed} 個已完成任務`}>
                {stats.completed}
              </div>
              <div className="todo-stats__card-label">已完成</div>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="todo-stats__progress-section">
          <div className="todo-stats__progress-header">
            <span className="todo-stats__progress-label">完成進度</span>
            <span 
              className="todo-stats__progress-percentage"
              data-testid="progress-percentage"
              aria-label={`完成進度 ${formatPercentage(stats.completionPercentage)}`}
            >
              {formatPercentage(stats.completionPercentage)}
            </span>
          </div>
          
          <div 
            className="todo-stats__progress-bar"
            role="progressbar"
            aria-valuenow={stats.completionPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`完成進度 ${stats.completionPercentage}%`}
            data-testid="progress-bar"
          >
            <div 
              className="todo-stats__progress-fill"
              style={{
                width: `${stats.completionPercentage}%`,
                backgroundColor: getProgressBarColor(stats.completionPercentage)
              }}
              data-testid="progress-fill"
            />
          </div>

          {/* Progress Text */}
          {stats.total > 0 && (
            <div className="todo-stats__progress-text">
              <span className="todo-stats__progress-description">
                {stats.completed === stats.total 
                  ? '🎉 所有任務都已完成！' 
                  : `還有 ${stats.active} 個任務待完成`
                }
              </span>
            </div>
          )}

          {/* Empty State */}
          {stats.total === 0 && (
            <div className="todo-stats__empty-state" data-testid="empty-state">
              <span className="todo-stats__empty-icon" aria-hidden="true">📝</span>
              <p className="todo-stats__empty-text">還沒有任何待辦事項</p>
              <p className="todo-stats__empty-hint">新增第一個任務開始使用吧！</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Memoized TodoStats component
 * Only re-renders when className prop changes
 */
export const TodoStats = memo(TodoStatsComponent);

export default TodoStats;