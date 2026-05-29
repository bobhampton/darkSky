import { useState, useEffect } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string | React.ReactNode;
}

const faqData: FAQItem[] = [
  {
    question: 'What is a dark sky calculator and how does it work?',
    answer: 'The darkSky calculator finds times when the sky is optimally dark for astronomy and light pollution monitoring. It identifies periods when the sun is 18° below the horizon (astronomical twilight) AND the moon is not visible in the sky. These conditions provide the darkest possible night sky for observations.',
  },
  {
    question: 'Why does the moon matter for dark sky observations?',
    answer: 'Even a thin crescent moon can significantly brighten the night sky and interfere with astronomical observations or light pollution measurements. Our calculator only shows times when the moon is completely below the horizon, ensuring truly dark conditions for your research or astrophotography.',
  },
  {
    question: 'What does "astronomical twilight" mean?',
    answer: (
      <>
        Astronomical twilight ends when the sun's center is 18 degrees below the horizon. At this point, the sun no longer illuminates the sky, and even the faintest stars become visible. This is the astronomical standard for defining true darkness used by astronomers worldwide.{' '}
        <a href="/getting-started#technical-details" className="text-blue-400 hover:text-blue-300 underline transition-colors">
          Learn more in our Getting Started guide
        </a>.
      </>
    ),
  },
  {
    question: 'Why are there no dark times for my location and date?',
    answer: 'This is normal in several situations: (1) High latitude locations during summer may experience continuous twilight with the sun never reaching 18° below the horizon; (2) Dates near full moon when the moon is up all night; (3) Times when the moon sets after astronomical twilight ends or rises before it begins.',
  },
  {
    question: 'How accurate are the calculations?',
    answer: 'Our calculator uses the Astronomy Engine library, which provides highly accurate celestial positions accounting for Earth\'s axial tilt, atmospheric refraction, observer elevation, and precise lunar orbit calculations. Results are accurate to within minutes for practical astronomical applications.',
  },
  {
    question: 'Can I use this calculator for astrophotography planning?',
    answer: 'Yes! The darkSky calculator is perfect for planning astrophotography sessions, especially for deep sky imaging. It helps you identify the best nights with no moon interference and maximum darkness for capturing faint celestial objects.',
  },
  {
    question: 'How do I use this for light pollution monitoring?',
    answer: (
      <>
        For light pollution monitoring, use the calculator to find consistent dark time windows across multiple dates. Export the data to CSV for analysis. The calculator ensures measurements are taken under standardized conditions (no moon, astronomical twilight) for valid long-term comparisons.{' '}
        <a href="/getting-started#exporting-data" className="text-blue-400 hover:text-blue-300 underline transition-colors">
          Learn more about exporting data
        </a>.
      </>
    ),
  },
  {
    question: 'Is my location data private and secure?',
    answer: (
      <>
        Yes! All your location data and saved locations are stored only in your browser's local storage. Nothing is transmitted to our servers. Your data never leaves your device. You can clear it anytime using your browser settings.{' '}
        <a href="/privacy" className="text-blue-400 hover:text-blue-300 underline transition-colors">
          Read our Privacy Policy
        </a>.
      </>
    ),
  },
  {
    question: 'What are the different window types (Dawn, Dusk, Polar Night)?',
    answer: 'Dusk windows occur in the evening after sunset before midnight. Dawn windows occur after midnight before sunrise. Polar Night (purple badge) indicates the entire night between astronomical twilights is dark with no moon. The type helps you plan observations based on your preferred time.',
  },
  {
    question: 'Can I export my results for research or publications?',
    answer: 'Absolutely! We provide two CSV export formats: Simple (just dark time windows) and Detailed (includes all astronomical event metadata). Exports include header information with attribution and your input parameters for proper documentation in research papers or reports.',
  },
];

/**
 * FAQ Section Component with Schema.org structured data for Google rich snippets
 * Displays collapsible FAQ items with SEO-optimized markup
 */
export function FAQSection() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  useEffect(() => {
    // Add FAQPage structured data to the page
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqData.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: typeof faq.answer === 'string' ? faq.answer : '',
        },
      })),
    });
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const toggleQuestion = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <section className="bg-gray-800 rounded-lg shadow-lg p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <HelpCircle className="w-7 h-7 text-blue-400" />
        <h2 className="text-3xl font-bold text-white">Frequently Asked Questions</h2>
      </div>

      <div className="space-y-3">
        {faqData.map((faq, index) => (
          <div
            key={index}
            className="bg-gray-700/50 rounded-lg overflow-hidden border border-gray-600 hover:border-gray-500 transition-colors"
          >
            <button
              onClick={() => toggleQuestion(index)}
              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-700/30 transition-colors"
              aria-expanded={expandedIndex === index}
              aria-controls={`faq-answer-${index}`}
            >
              <h3 className="text-lg font-semibold text-white pr-4">{faq.question}</h3>
              {expandedIndex === index ? (
                <ChevronUp className="w-5 h-5 text-blue-400 flex-shrink-0" aria-hidden="true" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" aria-hidden="true" />
              )}
            </button>

            {expandedIndex === index && (
              <div
                id={`faq-answer-${index}`}
                className="px-6 pb-4 text-gray-300 leading-relaxed"
                role="region"
              >
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
