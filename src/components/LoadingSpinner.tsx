interface LoadingSpinnerProps {
  progress?: {
    current: number;
    total: number;
    currentDate?: string;
  };
}

/**
 * Loading spinner component
 * Displays during astronomical calculations with optional progress
 */
export function LoadingSpinner({ progress }: LoadingSpinnerProps) {
  const percentage = progress
    ? Math.round((progress.current / progress.total) * 100)
    : 0;

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400"></div>
      <p className="mt-4 text-gray-400">
        {progress
          ? `Calculating dark times... ${percentage}% (${progress.current}/${progress.total} days)`
          : 'Calculating dark times...'}
      </p>
      {progress && progress.currentDate && (
        <p className="mt-2 text-sm text-gray-500">
          Processing: {progress.currentDate}
        </p>
      )}
    </div>
  );
}
