import { useEffect, useState } from 'react';
import { Check, Link2 } from 'lucide-react';
import { buildShareUrl } from '@/utils/shareLink';
import type { ObserverFormData } from '@/types';

interface ShareLinkButtonProps {
  /** Inputs used for the results being shown */
  formData: ObserverFormData;
}

/**
 * Copies a link that reopens the calculator with these results
 */
export function ShareLinkButton({ formData }: ShareLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  // Reset the confirmation after a moment
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const handleCopy = async () => {
    const url = buildShareUrl(formData, new URL(import.meta.env.BASE_URL, window.location.origin).href);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      // Clipboard can be unavailable (permissions, older browsers); let the user copy it manually
      window.prompt('Copy this link to share these results:', url);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-2 px-6 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-600
                 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400"
      aria-label="Copy a link to these results"
    >
      {copied ? <Check className="w-4 h-4" aria-hidden="true" /> : <Link2 className="w-4 h-4" aria-hidden="true" />}
      <span aria-live="polite">{copied ? 'Link Copied' : 'Copy Link'}</span>
    </button>
  );
}
