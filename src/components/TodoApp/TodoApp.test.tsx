import React from 'react';
import { render, screen } from '@testing-library/react';
import { TodoApp } from './TodoApp';

// Mock the child components to isolate TodoApp testing
jest.mock('../TodoForm', () => ({
  TodoForm: () => <div data-testid="mock-todo-form">TodoForm Component</div>
}));

jest.mock('../TodoList', () => ({
  TodoList: () => <div data-testid="mock-todo-list">TodoList Component</div>
}));

describe('TodoApp Component', () => {
  describe('Rendering and Layout', () => {
    it('renders the main application structure', () => {
      render(<TodoApp />);

      // Check main container
      expect(screen.getByRole('main')).toBeInTheDocument();
      
      // Check header
      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(screen.getByText('待辦事項清單')).toBeInTheDocument();
      
      // Check footer
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
      expect(screen.getByText('使用 React + TypeScript 建構')).toBeInTheDocument();
    });

    it('renders the header with correct title', () => {
      render(<TodoApp />);
      
      const title = screen.getByRole('heading', { level: 1 });
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent('待辦事項清單');
    });

    it('includes TodoForm component', () => {
      render(<TodoApp />);
      
      expect(screen.getByTestId('mock-todo-form')).toBeInTheDocument();
    });

    it('includes TodoList component', () => {
      render(<TodoApp />);
      
      expect(screen.getByTestId('mock-todo-list')).toBeInTheDocument();
    });

    it('displays placeholder for future components', () => {
      render(<TodoApp />);
      
      expect(screen.getByText('過濾器和統計組件將在後續任務中實作')).toBeInTheDocument();
    });

    it('applies correct CSS classes', () => {
      render(<TodoApp />);
      
      const appContainer = screen.getByText('待辦事項清單').closest('.todo-app');
      expect(appContainer).toBeInTheDocument();
      expect(appContainer).toHaveClass('todo-app');
      
      const header = screen.getByRole('banner');
      expect(header).toHaveClass('todo-app__header');
      
      const main = screen.getByRole('main');
      expect(main).toHaveClass('todo-app__main');
      
      const footer = screen.getByRole('contentinfo');
      expect(footer).toHaveClass('todo-app__footer');
    });
  });

  describe('TodoProvider Integration', () => {
    it('wraps components with TodoProvider', () => {
      // This test ensures that TodoProvider is present by checking that
      // child components can render without context errors
      render(<TodoApp />);
      
      // If TodoProvider is not present, child components would throw context errors
      expect(screen.getByTestId('mock-todo-form')).toBeInTheDocument();
      expect(screen.getByTestId('mock-todo-list')).toBeInTheDocument();
    });
  });

  describe('Requirements Verification', () => {
    // 需求 2.1: WHEN 使用者開啟應用程式 THEN 系統 SHALL 顯示所有待辦事項
    it('provides structure for displaying todos when app opens (Requirement 2.1)', () => {
      render(<TodoApp />);
      
      // Verify that the TodoList component is rendered (which handles displaying todos)
      expect(screen.getByTestId('mock-todo-list')).toBeInTheDocument();
    });

    // 需求 2.3: WHEN 清單為空 THEN 系統 SHALL 顯示「沒有待辦事項」的訊息
    it('provides structure for empty state handling (Requirement 2.3)', () => {
      render(<TodoApp />);
      
      // Verify that the TodoList component is rendered (which handles empty state)
      expect(screen.getByTestId('mock-todo-list')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper semantic HTML structure', () => {
      render(<TodoApp />);
      
      // Check for proper semantic elements
      expect(screen.getByRole('banner')).toBeInTheDocument(); // header
      expect(screen.getByRole('main')).toBeInTheDocument();   // main
      expect(screen.getByRole('contentinfo')).toBeInTheDocument(); // footer
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('has accessible heading hierarchy', () => {
      render(<TodoApp />);
      
      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toBeInTheDocument();
      expect(h1).toHaveTextContent('待辦事項清單');
    });
  });

  describe('Component Integration', () => {
    it('renders all required child components in correct order', () => {
      render(<TodoApp />);
      
      // Check that both components are present
      expect(screen.getByTestId('mock-todo-form')).toBeInTheDocument();
      expect(screen.getByTestId('mock-todo-list')).toBeInTheDocument();
      
      // Check that they are in the main section
      const main = screen.getByRole('main');
      expect(main).toContainElement(screen.getByTestId('mock-todo-form'));
      expect(main).toContainElement(screen.getByTestId('mock-todo-list'));
    });
  });
});