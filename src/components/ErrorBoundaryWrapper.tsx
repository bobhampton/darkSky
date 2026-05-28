import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ErrorBoundary } from './ErrorBoundary';

interface ErrorBoundaryWrapperProps {
  children: ReactNode;
}

/**
 * Wrapper component that provides navigation to ErrorBoundary
 * This is necessary because ErrorBoundary is a class component and can't use hooks
 */
export function ErrorBoundaryWrapper({ children }: ErrorBoundaryWrapperProps) {
  const navigate = useNavigate();
  return <ErrorBoundary navigate={navigate}>{children}</ErrorBoundary>;
}
