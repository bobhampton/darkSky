import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LoadingSpinner } from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  test('renders basic spinner without progress', () => {
    render(<LoadingSpinner />);
    
    const spinner = screen.getByText(/calculating/i);
    expect(spinner).toBeInTheDocument();
  });

  test('shows progress when provided', () => {
    render(
      <LoadingSpinner
        progress={{
          current: 5,
          total: 10,
        }}
      />
    );
    
    expect(screen.getByText(/calculating/i)).toBeInTheDocument();
    expect(screen.getByText(/5.*10/)).toBeInTheDocument();
  });

  test('displays current date during calculation', () => {
    render(
      <LoadingSpinner
        progress={{
          current: 3,
          total: 7,
          currentDate: '2024-01-15',
        }}
      />
    );
    
    expect(screen.getByText(/2024-01-15/)).toBeInTheDocument();
  });

  test('renders without crashing when progress is undefined', () => {
    const { container } = render(<LoadingSpinner progress={undefined} />);
    expect(container).toBeInTheDocument();
  });
});
