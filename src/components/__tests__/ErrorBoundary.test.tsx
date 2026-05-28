import { describe, test, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ErrorBoundary } from '../ErrorBoundary';

// Component that doesn't throw
function SafeComponent() {
  return <div>No error</div>;
}

describe('ErrorBoundary', () => {
  test('renders children when there is no error', () => {
    const mockNavigate = vi.fn();
    const { container } = render(
      <ErrorBoundary navigate={mockNavigate}>
        <SafeComponent />
      </ErrorBoundary>
    );
    
    expect(container.textContent).toContain('No error');
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('has componentDidCatch method', () => {
    expect(ErrorBoundary.prototype.componentDidCatch).toBeDefined();
    expect(typeof ErrorBoundary.prototype.componentDidCatch).toBe('function');
  });

  test('has getDerivedStateFromError method', () => {
    expect(ErrorBoundary.getDerivedStateFromError).toBeDefined();
    expect(typeof ErrorBoundary.getDerivedStateFromError).toBe('function');
  });
});
