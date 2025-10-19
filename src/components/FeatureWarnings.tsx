import { useEffect, useState } from 'react';
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import { detectAllFeatures, getUnsupportedFeatures } from '../utils/featureDetection';

export function FeatureWarnings() {
  const [unsupported, setUnsupported] = useState<Array<{ feature: string; message: string }>>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    detectAllFeatures();
    const unsupportedList = getUnsupportedFeatures();
    setUnsupported(unsupportedList);

    const stored = localStorage.getItem('dismissed-feature-warnings');
    if (stored) {
      try {
        setDismissed(new Set(JSON.parse(stored)));
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  const handleDismiss = (feature: string) => {
    const newDismissed = new Set(dismissed);
    newDismissed.add(feature);
    setDismissed(newDismissed);
    localStorage.setItem('dismissed-feature-warnings', JSON.stringify([...newDismissed]));
  };

  const visibleWarnings = unsupported.filter(item => !dismissed.has(item.feature));

  if (visibleWarnings.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md space-y-2">
      {visibleWarnings.map(({ feature, message }) => (
        <div
          key={feature}
          className="flex items-start gap-3 p-3 bg-yellow-900/90 border border-yellow-500/50 rounded-lg shadow-lg backdrop-blur-sm"
        >
          <FaExclamationTriangle className="text-yellow-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1 text-xs">
            <p className="font-semibold text-yellow-200 mb-1">
              {feature} not supported
            </p>
            <p className="text-yellow-300/90">
              {message}
            </p>
          </div>
          <button
            onClick={() => handleDismiss(feature)}
            className="text-yellow-400 hover:text-yellow-200 transition p-1"
            aria-label="Dismiss"
          >
            <FaTimes size={12} />
          </button>
        </div>
      ))}
    </div>
  );
}
