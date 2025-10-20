import { useState, useEffect } from 'react';

/**
 * Hook to manage keyboard shortcuts modal visibility
 * Shows modal when '?' key is pressed
 */
export function useKeyboardShortcutsModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for '?' key (Shift + /) - but only if not in an input/textarea
      if (
        e.key === '?' &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey
      ) {
        const target = e.target as HTMLElement;
        const isInput =
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable;

        if (!isInput) {
          e.preventDefault();
          setIsOpen((prev) => !prev);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((prev) => !prev),
  };
}
