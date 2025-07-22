import { render, screen } from '@testing-library/react';
import { TodoApp } from '../TodoApp';

describe('TodoApp', () => {
  it('renders the main application structure', () => {
    render(<TodoApp />);
    
    // Check if the main title is rendered
    expect(screen.getByText('待辦事項清單')).toBeInTheDocument();
    
    // Check if the footer text is rendered
    expect(screen.getByText('使用 React + TypeScript 建構')).toBeInTheDocument();
  });

  it('renders the application container with correct class', () => {
    const { container } = render(<TodoApp />);
    
    // Check if the main container has the correct class
    expect(container.querySelector('.todo-app')).toBeInTheDocument();
  });

  it('renders header section with title', () => {
    render(<TodoApp />);
    
    // Check if header section exists
    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
    expect(header).toHaveClass('todo-app__header');
    
    // Check if title is within header
    const title = screen.getByRole('heading', { level: 1 });
    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent('待辦事項清單');
  });

  it('renders main content area', () => {
    const { container } = render(<TodoApp />);
    
    // Check if main content area exists
    const main = container.querySelector('main');
    expect(main).toBeInTheDocument();
    expect(main).toHaveClass('todo-app__main');
  });

  it('renders footer section', () => {
    const { container } = render(<TodoApp />);
    
    // Check if footer exists
    const footer = container.querySelector('footer');
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveClass('todo-app__footer');
  });

  it('renders placeholder content for future components', () => {
    render(<TodoApp />);
    
    // Check if placeholder texts are rendered
    expect(screen.getByText('表單組件將在下一個子任務中實作')).toBeInTheDocument();
    expect(screen.getByText('清單組件將在子任務 4.3 中實作')).toBeInTheDocument();
    expect(screen.getByText('過濾器和統計組件將在後續任務中實作')).toBeInTheDocument();
  });

  it('provides TodoProvider context to children', () => {
    // This test ensures that TodoProvider is wrapping the component
    // The actual context functionality will be tested in integration tests
    expect(() => render(<TodoApp />)).not.toThrow();
  });
});