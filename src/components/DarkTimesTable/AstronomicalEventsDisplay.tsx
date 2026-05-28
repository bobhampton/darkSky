import { DEFAULT_TIMEZONE } from '@/utils/timezones';
import type { DarkTimeMetadata } from '@/types';

interface AstronomicalEventsDisplayProps {
  metadata: DarkTimeMetadata;
  timezone: string;
}

/**
 * Display astronomical events (astronomical night start/end, moonrise, moonset)
 */
export function AstronomicalEventsDisplay({ metadata, timezone }: AstronomicalEventsDisplayProps) {
  // Date formatter
  const formatTime = (date: Date) => {
    try {
      return date.toLocaleString('en-US', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch (error) {
      // Fallback to UTC if timezone formatting fails
      console.warn(`Timezone formatting error, falling back to ${DEFAULT_TIMEZONE}:`, error);
      return date.toLocaleString('en-US', {
        timeZone: DEFAULT_TIMEZONE,
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    }
  };

  return (
    <div className="mt-2 text-xs space-y-1 bg-gray-800/50 p-2 rounded">
      <div>
        <span className="text-gray-400">
          Astronomical Night Start{metadata.astronomicalNightStarts.length > 1 ? 's' : ''}:
        </span>{' '}
        {metadata.astronomicalNightStarts.length === 0 ? (
          <span className="text-white italic">
            {metadata.sunContinuouslyAboveTwilight
              ? 'Sun continuously above twilight limit'
              : metadata.sunContinuouslyBelowTwilight
              ? 'Sun continuously below twilight limit'
              : 'N/A'}
          </span>
        ) : (
          <div className="text-white space-y-0.5 ml-2">
            {metadata.astronomicalNightStarts.map((start, idx) => (
              <div key={idx}>{formatTime(start)}</div>
            ))}
          </div>
        )}
      </div>
      <div>
        <span className="text-gray-400">
          Astronomical Night End{metadata.astronomicalNightEnds.length > 1 ? 's' : ''}:
        </span>{' '}
        {metadata.astronomicalNightEnds.length === 0 ? (
          <span className="text-white italic">
            {metadata.sunContinuouslyAboveTwilight
              ? 'Sun continuously above twilight limit'
              : metadata.sunContinuouslyBelowTwilight
              ? 'Sun continuously below twilight limit'
              : 'N/A'}
          </span>
        ) : (
          <div className="text-white space-y-0.5 ml-2">
            {metadata.astronomicalNightEnds.map((end, idx) => (
              <div key={idx}>{formatTime(end)}</div>
            ))}
          </div>
        )}
      </div>
      <div>
        <span className="text-gray-400">
          Moon Rise{metadata.moonRises.length > 1 ? 's' : ''}:
        </span>{' '}
        {metadata.moonRises.length === 0 ? (
          <span className="text-white italic">
            {metadata.moonContinuouslyAboveHorizon
              ? 'Moon continuously above horizon'
              : metadata.moonContinuouslyBelowHorizon
              ? 'Moon continuously below horizon'
              : 'N/A'}
          </span>
        ) : (
          <div className="text-white space-y-0.5 ml-2">
            {metadata.moonRises.map((rise, idx) => (
              <div key={idx}>{formatTime(rise)}</div>
            ))}
          </div>
        )}
      </div>
      <div>
        <span className="text-gray-400">
          Moon Set{metadata.moonSets.length > 1 ? 's' : ''}:
        </span>{' '}
        {metadata.moonSets.length === 0 ? (
          <span className="text-white italic">
            {metadata.moonContinuouslyAboveHorizon
              ? 'Moon continuously above horizon'
              : metadata.moonContinuouslyBelowHorizon
              ? 'Moon continuously below horizon'
              : 'N/A'}
          </span>
        ) : (
          <div className="text-white space-y-0.5 ml-2">
            {metadata.moonSets.map((set, idx) => (
              <div key={idx}>{formatTime(set)}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
