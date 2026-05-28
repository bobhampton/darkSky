import { describe, test, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { ObserverForm } from '../ObserverForm';
import { ObserverProvider } from '@/context/ObserverContext';

// Helper to render with context
function renderWithContext(ui: React.ReactElement) {
  return render(<ObserverProvider>{ui}</ObserverProvider>);
}

describe('ObserverForm', () => {
  test('renders all form fields', () => {
    const mockSubmit = vi.fn();
    renderWithContext(<ObserverForm onSubmit={mockSubmit} isCalculating={false} />);
    
    // Check for input fields by their placeholders or roles
    expect(screen.getByPlaceholderText(/40.7128/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/-74.0060/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e\.g\.,\s*0/i)).toBeInTheDocument();
    
    // Check for date inputs
    const dateInputs = screen.getAllByDisplayValue(/\d{4}-\d{2}-\d{2}/);
    expect(dateInputs.length).toBeGreaterThanOrEqual(2);
    
    // Check for submit button
    expect(screen.getByRole('button', { name: /calculate/i })).toBeInTheDocument();
  });

  test('submit button is disabled when calculating', () => {
    const mockSubmit = vi.fn();
    renderWithContext(<ObserverForm onSubmit={mockSubmit} isCalculating={true} />);
    
    const submitButton = screen.getByRole('button', { name: /calculating/i });
    expect(submitButton).toBeDisabled();
  });

  test('submit button is enabled when not calculating', () => {
    const mockSubmit = vi.fn();
    renderWithContext(<ObserverForm onSubmit={mockSubmit} isCalculating={false} />);
    
    const submitButton = screen.getByRole('button', { name: /calculate/i });
    expect(submitButton).toBeEnabled();
  });

  test('displays validation error for invalid latitude', async () => {
    const user = userEvent.setup();
    const mockSubmit = vi.fn();
    renderWithContext(<ObserverForm onSubmit={mockSubmit} isCalculating={false} />);
    
    const latitudeInput = screen.getByPlaceholderText(/40.7128/i);
    await user.clear(latitudeInput);
    await user.type(latitudeInput, '999');
    
    const submitButton = screen.getByRole('button', { name: /calculate/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      // Check for validation error (may appear in banner and inline)
      const errors = screen.getAllByText(/latitude must be between -90 and 90/i);
      expect(errors.length).toBeGreaterThan(0);
    });
    
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  test('displays validation error for invalid longitude', async () => {
    const user = userEvent.setup();
    const mockSubmit = vi.fn();
    renderWithContext(<ObserverForm onSubmit={mockSubmit} isCalculating={false} />);
    
    const longitudeInput = screen.getByPlaceholderText(/-74.0060/i);
    await user.clear(longitudeInput);
    await user.type(longitudeInput, '999');
    
    const submitButton = screen.getByRole('button', { name: /calculate/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      // Check for validation error (may appear in banner and inline)
      const errors = screen.getAllByText(/longitude must be between -180 and 180/i);
      expect(errors.length).toBeGreaterThan(0);
    });
    
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  test('displays validation error for empty required field', async () => {
    const user = userEvent.setup();
    const mockSubmit = vi.fn();
    renderWithContext(<ObserverForm onSubmit={mockSubmit} isCalculating={false} />);
    
    const latitudeInput = screen.getByPlaceholderText(/40.7128/i);
    await user.clear(latitudeInput);
    
    const submitButton = screen.getByRole('button', { name: /calculate/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      // Check for validation error (may appear in banner and inline)
      const errors = screen.getAllByText(/latitude is required/i);
      expect(errors.length).toBeGreaterThan(0);
    });
    
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  test('calls onSubmit with correct data when form is valid', async () => {
    const user = userEvent.setup();
    const mockSubmit = vi.fn();
    renderWithContext(<ObserverForm onSubmit={mockSubmit} isCalculating={false} />);
    
    // Fill in valid data
    const latitudeInput = screen.getByPlaceholderText(/40.7128/i);
    const longitudeInput = screen.getByPlaceholderText(/-74.0060/i);
    const elevationInput = screen.getByPlaceholderText(/e\.g\.,\s*0/i);
    
    await user.clear(latitudeInput);
    await user.type(latitudeInput, '40.7128');
    
    await user.clear(longitudeInput);
    await user.type(longitudeInput, '-74.006');
    
    await user.clear(elevationInput);
    await user.type(elevationInput, '10');
    
    const submitButton = screen.getByRole('button', { name: /calculate/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          latitude: '40.7128',
          longitude: '-74.006',
          elevation: '10',
        })
      );
    });
  });

  test('displays validation error for negative elevation', async () => {
    const user = userEvent.setup();
    const mockSubmit = vi.fn();
    renderWithContext(<ObserverForm onSubmit={mockSubmit} isCalculating={false} />);
    
    const elevationInput = screen.getByPlaceholderText(/e\.g\.,\s*0/i);
    await user.clear(elevationInput);
    await user.type(elevationInput, '-100');
    
    const submitButton = screen.getByRole('button', { name: /calculate/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      // Check for validation error (may appear in banner and inline)
      const errors = screen.getAllByText(/elevation cannot be negative/i);
      expect(errors.length).toBeGreaterThan(0);
    });
    
    expect(mockSubmit).not.toHaveBeenCalled();
  });
});
