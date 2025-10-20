import { useEffect, useState } from 'react';

interface LiveRegionProps {
  message: string;
  priority?: 'polite' | 'assertive';
  clearAfter?: number; // ms to clear message after announcing
}

/**
 * Accessible live region for screen reader announcements
 * Use this component to announce dynamic changes to screen reader users
 */
const LiveRegion: React.FC<LiveRegionProps> = ({
  message,
  priority = 'polite',
  clearAfter = 1000,
}) => {
  const [currentMessage, setCurrentMessage] = useState('');

  useEffect(() => {
    if (message) {
      setCurrentMessage(message);

      if (clearAfter) {
        const timer = setTimeout(() => {
          setCurrentMessage('');
        }, clearAfter);

        return () => clearTimeout(timer);
      }
    }
  }, [message, clearAfter]);

  return (
    <div
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {currentMessage}
    </div>
  );
};

export default LiveRegion;
