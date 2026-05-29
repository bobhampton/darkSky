import { exportTableToCSV } from '@/utils/csvExport';
import type { DarkTimesData } from '@/types';
import type { FilterInfo } from '@/utils';

interface ExportControlsProps {
  darkTimesData: DarkTimesData;
  timezone: string;
  formData: {
    latitude: string;
    longitude: string;
    elevation: string;
    dateStart: string;
    dateEnd: string;
  };
  filterInfo: FilterInfo;
  disabled?: boolean;
}

/**
 * Export controls for downloading CSV data
 */
export function ExportControls({ darkTimesData, timezone, formData, filterInfo, disabled = false }: ExportControlsProps) {
  const handleExport = (minimal: boolean) => {
    exportTableToCSV(
      darkTimesData,
      timezone,
      {
        latitude: formData.latitude,
        longitude: formData.longitude,
        elevation: formData.elevation,
        dateStart: formData.dateStart,
        dateEnd: formData.dateEnd,
        timezone,
      },
      `dark_times_${minimal ? 'simple' : 'detailed'}_${new Date().toISOString().split('T')[0]}.csv`,
      minimal,
      filterInfo
    );
  };

  return (
    <div className="flex flex-wrap gap-4">
      <button
        onClick={() => handleExport(true)}
        disabled={disabled}
        className="px-6 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-700 
                   disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors
                   focus:outline-none focus:ring-2 focus:ring-blue-400"
        aria-label="Export simple CSV with basic dark times data"
      >
        Export Simple CSV
      </button>
      <button
        onClick={() => handleExport(false)}
        disabled={disabled}
        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 
                   disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors
                   focus:outline-none focus:ring-2 focus:ring-green-400"
        aria-label="Export detailed CSV with comprehensive astronomical data"
      >
        Export Detailed CSV
      </button>
    </div>
  );
}
