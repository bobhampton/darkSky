interface TypeBadgeProps {
  type: string;
}

/**
 * Badge for window type
 */
export function TypeBadge({ type }: TypeBadgeProps) {
  const colors: Record<string, string> = {
    polarNight: 'bg-purple-600',
    dawn: 'bg-blue-600',
    dusk: 'bg-orange-600',
    metaOnly: 'bg-gray-600',
  };

  const labels: Record<string, string> = {
    polarNight: 'Polar Night',
    dawn: 'Dawn',
    dusk: 'Dusk',
    metaOnly: 'Info',
  };

  return (
    <span className={`px-2 py-1 rounded text-xs text-white ${colors[type] || 'bg-gray-600'}`}>
      {labels[type] || type}
    </span>
  );
}
