import { TodoProvider } from '../../context/TodoContext';
import { TodoForm } from '../TodoForm';
import { TodoList } from '../TodoList';
import { TodoFilter } from '../TodoFilter';
import { TodoStats } from '../TodoStats';
import { usePerformanceTracking } from '../../utils/performance';
import './TodoApp.css';

/**
 * Main TodoApp component that provides the overall layout and structure
 * Integrates TodoProvider to provide global state to all child components
 * Includes performance tracking for development
 */
export function TodoApp() {
  // Track performance in development mode
  usePerformanceTracking('TodoApp');
  
  return (
    <TodoProvider>
      <div className="todo-app">
        <header className="todo-app__header">
          <h1 className="todo-app__title">待辦事項清單</h1>
        </header>
        
        <main className="todo-app__main">
          {/* TodoForm component for adding new todos */}
          <TodoForm />
          
          {/* TodoFilter component for filtering todos */}
          <TodoFilter />
          
          {/* TodoList component */}
          <TodoList />
          
          {/* TodoStats component for displaying statistics */}
          <TodoStats />
        </main>
        
        <footer className="todo-app__footer">
          <p className="todo-app__footer-text">
            使用 React + TypeScript 建構
          </p>
        </footer>
      </div>
    </TodoProvider>
  );
}