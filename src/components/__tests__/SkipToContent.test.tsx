import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SkipToContent } from '../SkipToContent';

describe('SkipToContent', () => {
  it('renders skip link with correct href', () => {
    render(<SkipToContent />);
    const link = screen.getByText('Skip to main content');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '#main-content');
  });

  it('has sr-only class by default (visually hidden)', () => {
    render(<SkipToContent />);
    const link = screen.getByText('Skip to main content');
    expect(link).toHaveClass('sr-only');
  });

  it('becomes visible on focus with proper styling', () => {
    render(<SkipToContent />);
    const link = screen.getByText('Skip to main content');
    
    // Should have focus styles
    expect(link).toHaveClass('focus:not-sr-only');
    expect(link).toHaveClass('focus:absolute');
    expect(link).toHaveClass('focus:z-50');
  });

  it('has accessible positioning when focused', () => {
    render(<SkipToContent />);
    const link = screen.getByText('Skip to main content');
    
    // Should position at top-left when focused
    expect(link).toHaveClass('focus:top-4');
    expect(link).toHaveClass('focus:left-4');
  });

  it('has proper focus ring styles', () => {
    render(<SkipToContent />);
    const link = screen.getByText('Skip to main content');
    
    expect(link).toHaveClass('focus:ring-2');
    expect(link).toHaveClass('focus:ring-purple-400');
  });
});
