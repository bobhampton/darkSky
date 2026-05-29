import { Link } from 'react-router-dom';
import { Home, MapPin, Download, LineChart, Info } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  ASTRONOMICAL_TWILIGHT_THRESHOLD,
} from '@/utils/constants';

/**
 * Getting Started page - Comprehensive guide for using Dark Sky Calculator
 */
export function GettingStartedPage() {
  const [activeSection, setActiveSection] = useState<string>('what-is');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-100px 0px -66% 0px',
        threshold: 0,
      }
    );

    const sections = [
      'what-is',
      'quick-start',
      'understanding-inputs',
      'reading-results',
      'exporting-data',
      'tips',
      'technical-details',
    ];

    sections.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      sections.forEach((id) => {
        const element = document.getElementById(id);
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex gap-8">
        {/* Sidebar Table of Contents */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24 bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold text-blue-400 mb-4">On This Page</h3>
            <nav className="space-y-2">
              <button
                onClick={() => scrollToSection('what-is')}
                className={`block w-full text-left text-sm px-3 py-2 rounded transition-colors ${
                  activeSection === 'what-is'
                    ? 'text-white bg-blue-600 font-semibold'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                What is the Calculator?
              </button>
              <button
                onClick={() => scrollToSection('quick-start')}
                className={`block w-full text-left text-sm px-3 py-2 rounded transition-colors ${
                  activeSection === 'quick-start'
                    ? 'text-white bg-blue-600 font-semibold'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                Quick Start Guide
              </button>
              <button
                onClick={() => scrollToSection('understanding-inputs')}
                className={`block w-full text-left text-sm px-3 py-2 rounded transition-colors ${
                  activeSection === 'understanding-inputs'
                    ? 'text-white bg-blue-600 font-semibold'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                Understanding Inputs
              </button>
              <button
                onClick={() => scrollToSection('reading-results')}
                className={`block w-full text-left text-sm px-3 py-2 rounded transition-colors ${
                  activeSection === 'reading-results'
                    ? 'text-white bg-blue-600 font-semibold'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                Reading Results
              </button>
              <button
                onClick={() => scrollToSection('exporting-data')}
                className={`block w-full text-left text-sm px-3 py-2 rounded transition-colors ${
                  activeSection === 'exporting-data'
                    ? 'text-white bg-blue-600 font-semibold'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                Exporting Data
              </button>
              <button
                onClick={() => scrollToSection('tips')}
                className={`block w-full text-left text-sm px-3 py-2 rounded transition-colors ${
                  activeSection === 'tips'
                    ? 'text-white bg-blue-600 font-semibold'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                Tips & Best Practices
              </button>
              <button
                onClick={() => scrollToSection('technical-details')}
                className={`block w-full text-left text-sm px-3 py-2 rounded transition-colors ${
                  activeSection === 'technical-details'
                    ? 'text-white bg-blue-600 font-semibold'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                Technical Details
              </button>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 bg-gray-800 rounded-lg shadow-lg p-8">
        {/* Header */}
        <h1 className="text-4xl font-bold text-blue-400 mb-4">Getting Started</h1>
        <p className="text-gray-300 text-lg mb-8">
          Learn how to use the Dark Sky Calculator to find optimal observation times for astronomy and light pollution monitoring.
        </p>

        {/* Introduction Section */}
        <Section id="what-is" title="What is the Dark Sky Calculator?" icon={<Info className="w-6 h-6" />}>
          <p className="text-gray-300 mb-4">
            The Dark Sky Calculator helps you identify periods of complete darkness—times when both the Sun is far below 
            the horizon (astronomical twilight ends) and the Moon is not visible. These conditions are ideal for:
          </p>
          <ul className="list-disc list-inside text-gray-300 space-y-2 mb-4">
            <li>Astronomical observations and astrophotography</li>
            <li>Light pollution monitoring and research</li>
            <li>Night sky quality assessments</li>
          </ul>
          <p className="text-gray-300">
            The calculator determines when the Sun is at least <strong className="text-blue-400">{ASTRONOMICAL_TWILIGHT_THRESHOLD}° below the horizon</strong> (astronomical 
            twilight) and when the Moon is absent from the sky, providing you with precise dark time windows.
          </p>
        </Section>

        {/* Quick Start Guide */}
        <Section id="quick-start" title="Quick Start Guide" icon={<Home className="w-6 h-6" />}>
          <div className="space-y-4">
            <Step number={1} title="Navigate to the Calculator">
              From the navigation bar, click <strong className="text-blue-400">Home</strong> to access the main calculator interface.
            </Step>

            <Step number={2} title="Choose Your Location">
              <p className="text-gray-300 mb-3">
                You have multiple options for setting your observation location using the two-tab interface:
              </p>
              
              <div className="bg-gray-700/30 rounded-lg p-4 mb-3">
                <h4 className="text-blue-400 font-semibold mb-2">🔍 Search Tab</h4>
                <ul className="list-disc list-inside text-gray-300 space-y-1 ml-2">
                  <li><strong>Search by name:</strong> Type a city, address, or landmark (e.g., "Yellowstone National Park")</li>
                  <li><strong>Enter coordinates:</strong> Type latitude, longitude format (e.g., "40.7128, -74.0060")</li>
                  <li><strong>Use the map:</strong> Click anywhere on the interactive map to place a marker</li>
                  <li><strong>GPS location:</strong> Click "My Location" button to use your current position</li>
                </ul>
              </div>
              
              <div className="bg-gray-700/30 rounded-lg p-4">
                <h4 className="text-purple-400 font-semibold mb-2">📍 Saved Tab</h4>
                <ul className="list-disc list-inside text-gray-300 space-y-1 ml-2">
                  <li>Select from previously saved locations</li>
                  <li>Save new locations for future use (stored in your browser)</li>
                  <li>Delete locations you no longer need</li>
                </ul>
              </div>
              
              <p className="text-gray-400 text-sm mt-3 italic">
                <strong>Map controls:</strong> My Location (GPS), Center (recenter on marker), Clear (remove marker), Light/Dark (toggle map theme)
              </p>
            </Step>

            <Step number={3} title="Select Your Timezone">
              Choose the timezone from the dropdown menu that you want the results to be displayed in. 
              Start typing to filter the list. This ensures all times are displayed in the selected time zone.
            </Step>

            <Step number={4} title="Choose Date Range">
              Select the start and end dates for your observation period. The calculator will analyze each date in the range 
              to find dark time windows.
            </Step>

            <Step number={5} title="Calculate">
              Click the <strong className="text-blue-400">"Calculate Dark Times"</strong> button. The calculation may take a 
              few moments depending on the date range.
            </Step>

            <Step number={6} title="Review Results">
              The results table will display all dark time windows found within your date range. Use the expandable sections 
              to see detailed astronomical event information or use the filters to only show specific types of windows or minimum durations.
            </Step>
          </div>
        </Section>

        {/* Understanding Inputs */}
        <Section id="understanding-inputs" title="Understanding Your Inputs" icon={<MapPin className="w-6 h-6" />}>
          <div className="space-y-4">
            <InputDetail title="Latitude & Longitude">
              <p className="text-gray-300 mb-2">
                Your geographic coordinates determine the Sun and Moon positions relative to your location.
              </p>
              <p className="text-gray-400 text-sm">
                <strong>How to find them:</strong> Use the built-in location search (just type a place name), 
                GPS button for your current location, or click directly on the interactive map. You can also 
                enter coordinates manually if you have them.
              </p>
            </InputDetail>

            <InputDetail title="Elevation">
              <p className="text-gray-300 mb-2">
                Elevation affects the horizon and atmospheric refraction calculations, though the impact is typically small 
                for most applications.
              </p>
              <p className="text-gray-400 text-sm">
                <strong>Tip:</strong> If you don't know your exact elevation, an approximate value (within 100m) is usually sufficient.
              </p>
            </InputDetail>

            <InputDetail title="Timezone">
              <p className="text-gray-300 mb-2">
                Critical for displaying times correctly. The calculator handles daylight saving time 
                automatically based on your selected timezone. Setting the timezone allows you to see 
                results in local time or any other desired timezone.
              </p>
              <p className="text-gray-400 text-sm">
                <strong>Note:</strong> Use IANA timezone names (e.g., "America/New_York" not "EST").
              </p>
            </InputDetail>

            <InputDetail title="Date Range">
              <p className="text-gray-300 mb-2">
                The period you want to analyze for dark time windows. Shorter ranges calculate faster, but longer ranges 
                help identify patterns over time.
              </p>
              <p className="text-gray-400 text-sm">
                <strong>Recommendation:</strong> Start with a week or month, then expand as needed.
              </p>
            </InputDetail>

            <InputDetail title="Saved Locations">
              <p className="text-gray-300 mb-2">
                Save your frequently-used observation sites for quick access. Saved locations are stored 
                in your browser's local storage and include the full address, coordinates, timezone, and elevation.
              </p>
              <p className="text-gray-400 text-sm">
                <strong>Note:</strong> Clearing your browser's website data will remove all saved locations. 
                Export important data before clearing browser storage.
              </p>
            </InputDetail>
          </div>
        </Section>

        {/* Reading Results */}
        <Section id="reading-results" title="Reading Your Results" icon={<LineChart className="w-6 h-6" />}>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white mb-2">Understanding the Results Table</h3>
            
            <ResultDetail title="Dark Windows Column">
              Shows the number of dark time periods found for each date. Click <strong className="text-blue-400">"Expand"</strong> if 
              multiple windows exist to see details for each window including start time, end time, and duration.
            </ResultDetail>

            <ResultDetail title="Astronomical Events">
              Click <strong className="text-blue-400">"Show"</strong> to expand and see detailed information:
              <ul className="list-disc list-inside text-gray-300 space-y-1 mt-2 ml-4">
                <li><strong>Astronomical Night Start/End:</strong> When the Sun reaches {ASTRONOMICAL_TWILIGHT_THRESHOLD}° below the horizon</li>
                <li><strong>Moon Rise/Set:</strong> When the Moon crosses the horizon</li>
                <li>Special conditions (e.g., "Moon continuously below horizon")</li>
              </ul>
            </ResultDetail>

            <ResultDetail title="Type Badges & Duration">
              Windows are classified by type with color-coded vertical badges integrated into each window box:
              <ul className="list-disc list-inside text-gray-300 space-y-1 mt-2 ml-4">
                <li><strong className="text-purple-400">Purple (Polar Night):</strong> Entire night between astronomical twilights</li>
                <li><strong className="text-orange-400">Orange (Dusk):</strong> Dark period after sunset before midnight</li>
                <li><strong className="text-blue-400">Blue (Dawn):</strong> Dark period after midnight before sunrise</li>
              </ul>
              <p className="text-gray-300 mt-2">
                The <strong>Duration</strong> column (immediately to the right of Dark Windows) shows how long each window lasts in hours and minutes (e.g., "4h 32m").
              </p>
            </ResultDetail>

            <ResultDetail title="Filter Controls">
              Click the <strong className="text-purple-400">"Filter Controls"</strong> banner to expand/collapse filtering options:
              <ul className="list-disc list-inside text-gray-300 space-y-1 mt-2 ml-4">
                <li><strong>Minimum Duration:</strong> Show only windows longer than specified hours</li>
                <li><strong>Window Types:</strong> Filter by Dawn, Dusk, or hide empty days entirely</li>
                <li><strong>Time Range:</strong> Display only windows within specific hours (e.g., 8 PM to 10 PM)</li>
              </ul>
              <p className="text-gray-400 text-sm mt-2">
                <em>Active filters apply to both table display and CSV exports.</em>
              </p>
            </ResultDetail>

            <ResultDetail title="View Chart">
              Opens an interactive chart showing Sun and Moon altitude throughout the day. The shaded area indicates when 
              dark time conditions are met.
            </ResultDetail>
          </div>
        </Section>

        {/* Exporting Data */}
        <Section id="exporting-data" title="Exporting Data" icon={<Download className="w-6 h-6" />}>
          <p className="text-gray-300 mb-4">
            Export your results in CSV format for further analysis or record keeping. Two export options are available:
          </p>
          
          <div className="space-y-4">
            <ExportDetail title="Simple CSV" color="bg-blue-600">
              Contains the essential dark time windows organized by date:
              <ul className="list-disc list-inside text-gray-300 space-y-1 mt-2 ml-4">
                <li>Date (YYYY-MM-DD)</li>
                <li>Dark Time Start (Dawn) and Dark Time End (Dawn)</li>
                <li>Dark Time Start (Dusk) and Dark Time End (Dusk)</li>
              </ul>
              <p className="text-gray-400 text-sm mt-2">
                <strong>Best for:</strong> Quick reference, sharing results, basic analysis
              </p>
            </ExportDetail>

            <ExportDetail title="Detailed CSV" color="bg-green-600">
              Includes all simple CSV data plus detailed astronomical metadata:
              <ul className="list-disc list-inside text-gray-300 space-y-1 mt-2 ml-4">
                <li>All simple CSV columns</li>
                <li>Moon rise and moon set times</li>
                <li>Moon altitude at start and end of day (00:00:00, 23:59:59)</li>
                <li>Astronomical twilight start and end times (Sun at {ASTRONOMICAL_TWILIGHT_THRESHOLD}°)</li>
                <li>Moon altitude at astronomical twilight boundaries</li>
              </ul>
              <p className="text-gray-400 text-sm mt-2">
                <strong>Best for:</strong> Research, detailed analysis, troubleshooting, verifying calculations
              </p>
            </ExportDetail>
          </div>

          <p className="text-gray-300 mt-4">
            Both formats include a header with attribution information (for citing in publications), your input parameters 
            (location, timezone, date range), and any active filters applied to the data.
          </p>
        </Section>

        {/* Tips & Best Practices */}
        <Section id="tips" title="Tips & Best Practices">
          <div className="bg-gray-700/50 rounded-lg p-4 space-y-3">
            <Tip>
              <strong>Moon phases matter:</strong> New moon periods typically provide longer dark time windows. Check 
              around new moon dates for optimal conditions.
            </Tip>
            
            <Tip>
              <strong>Seasonal variations:</strong> Summer locations near the poles may have continuous twilight (no dark 
              times), while winter offers longer dark periods.
            </Tip>
            
            <Tip>
              <strong>Plan ahead:</strong> Calculate dark times well in advance for important observations. Weather 
              conditions may limit actual observing opportunities.
            </Tip>
            
            <Tip>
              <strong>No dark times found?</strong> This is normal for:
              <ul className="list-disc list-inside ml-4 mt-1">
                <li>High latitude locations during summer (continuous twilight)</li>
                <li>Dates near full moon when the Moon is up all night</li>
                <li>Times when the Moon sets after astronomical twilight ends</li>
              </ul>
            </Tip>
          </div>
        </Section>

        {/* Technical Details */}
        <Section id="technical-details" title="Technical Details">
          <div className="space-y-4">
            <TechnicalDetail title={`What is Astronomical Twilight (${ASTRONOMICAL_TWILIGHT_THRESHOLD}°)?`}>
              Astronomical twilight ends when the Sun's center is {Math.abs(ASTRONOMICAL_TWILIGHT_THRESHOLD)} degrees below the horizon. At this point, the Sun no 
              longer illuminates the sky, and the faintest stars become visible. This is the standard used by astronomers 
              worldwide for defining true darkness.
            </TechnicalDetail>

            <TechnicalDetail title="Why Does Moon Presence Matter?">
              Even a thin crescent moon can significantly brighten the night sky, affecting observations and light pollution 
              measurements. The calculator only reports times when the Moon is completely below the horizon.
            </TechnicalDetail>

            <TechnicalDetail title="Calculation Precision">
              This calculator uses the <a href="https://github.com/cosinekitty/astronomy" className="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">Astronomy Engine</a> library, 
              which provides highly accurate celestial body positions accounting for:
              <ul className="list-disc list-inside text-gray-300 space-y-1 mt-2 ml-4">
                <li>Earth's axial tilt and precession</li>
                <li>Atmospheric refraction</li>
                <li>Observer elevation effects</li>
                <li>Precise lunar orbit calculations</li>
              </ul>
            </TechnicalDetail>
          </div>
        </Section>

        {/* Return to Calculator */}
        <div className="mt-8 pt-6 border-t border-gray-700 text-center">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <Home className="w-5 h-5" />
            <span>Return to Calculator</span>
          </Link>
        </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components

function Section({ id, title, icon, children }: { id?: string; title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-8 pb-8 border-b border-gray-700 last:border-b-0 scroll-mt-24">
      <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
        {icon}
        {title}
      </h2>
      {children}
    </section>
  );
}

function Step({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
        {number}
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <div className="text-gray-300">{children}</div>
      </div>
    </div>
  );
}

function InputDetail({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-700/50 rounded-lg p-4">
      <h4 className="text-lg font-semibold text-blue-400 mb-2">{title}</h4>
      {children}
    </div>
  );
}

function ResultDetail({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-lg font-semibold text-blue-400 mb-2">{title}</h4>
      <div className="text-gray-300">{children}</div>
    </div>
  );
}

function ExportDetail({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-700/50 rounded-lg p-4 border-l-4" style={{ borderColor: color.replace('bg-', '') }}>
      <h4 className={`text-lg font-semibold text-white mb-2 inline-flex items-center gap-2`}>
        <span className={`px-3 py-1 rounded ${color} text-sm`}>{title}</span>
      </h4>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-gray-300 text-sm leading-relaxed">
      💡 {children}
    </div>
  );
}

function TechnicalDetail({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600">
      <h4 className="text-lg font-semibold text-blue-400 mb-2">{title}</h4>
      <div className="text-gray-300 text-sm leading-relaxed">{children}</div>
    </div>
  );
}
