import { TodoProvider } from '../../context/TodoContext';
import { TodoForm } from '../TodoForm';
import { TodoList } from '../TodoList';
import './TodoApp.css';

/**
 * Main TodoApp component that provides the overall layout and structure
 * Integrates TodoProvider to provide global state to all child components
 */
export function TodoApp() {
  return (
    <TodoProvider>
      <div className="todo-app">
        <header className="todo-app__header">
          <h1 className="todo-app__title">待辦事項清單</h1>
        </header>
        
        <main className="todo-app__main">
          {/* TodoForm component for adding new todos */}
          <TodoForm />
          
          {/* TodoList component */}
          <TodoList />
          
          {/* TodoFilter and TodoStats will be added in later tasks */}
          <div className="todo-app__placeholder">
            過濾器和統計組件將在後續任務中實作
          </div>
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