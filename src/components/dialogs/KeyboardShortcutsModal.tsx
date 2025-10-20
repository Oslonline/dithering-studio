import { useEffect } from 'react';
import { createFocusTrap } from '../../utils/a11y';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutSection {
  title: string;
  shortcuts: Array<{
    keys: string[];
    description: string;
  }>;
}

const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const modalElement = document.querySelector('[role="dialog"]') as HTMLElement;
    if (!modalElement) return;

    const cleanup = createFocusTrap(modalElement);
    return cleanup;
  }, [isOpen]);

  if (!isOpen) return null;

  const sections: ShortcutSection[] = [
    {
      title: 'Navigation',
      shortcuts: [
        { keys: ['←', '→'], description: 'Navigate between loaded images' },
        { keys: ['Tab'], description: 'Move to next control' },
        { keys: ['Shift', 'Tab'], description: 'Move to previous control' },
      ],
    },
    {
      title: 'View Controls',
      shortcuts: [
        { keys: ['F'], description: 'Toggle Focus Mode (hide UI)' },
        { keys: ['G'], description: 'Toggle pixel grid' },
        { keys: ['Shift', 'G'], description: 'Cycle grid size' },
        { keys: ['Ctrl/⌘', '0'], description: 'Fit to screen (100%)' },
        { keys: ['Ctrl/⌘', '1'], description: 'Actual size (100%)' },
        { keys: ['Ctrl/⌘', '+'], description: 'Zoom in' },
        { keys: ['Ctrl/⌘', '-'], description: 'Zoom out' },
      ],
    },
    {
      title: 'Canvas Controls',
      shortcuts: [
        { keys: ['Mouse Drag'], description: 'Pan canvas' },
        { keys: ['Scroll'], description: 'Zoom in/out at cursor' },
        { keys: ['Space', 'Drag'], description: 'Pan (alternative)' },
      ],
    },
    {
      title: 'General',
      shortcuts: [
        { keys: ['?'], description: 'Show this help dialog' },
        { keys: ['Esc'], description: 'Close dialog/modal' },
      ],
    },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="keyboard-shortcuts-title"
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-neutral-900 border border-neutral-700 rounded-lg shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-neutral-900/95 backdrop-blur-sm border-b border-neutral-800">
          <h2
            id="keyboard-shortcuts-title"
            className="text-lg font-semibold text-gray-100"
          >
            ⌨️ Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-100 rounded transition focus-visible:shadow-[var(--focus-ring)]"
            aria-label="Close shortcuts dialog"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
                {section.title}
              </h3>
              <div className="space-y-2">
                {section.shortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between gap-4 py-2 px-3 rounded bg-neutral-800/40 hover:bg-neutral-800/60 transition"
                  >
                    <span className="text-sm text-gray-200">
                      {shortcut.description}
                    </span>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {shortcut.keys.map((key, keyIndex) => (
                        <span key={keyIndex} className="flex items-center gap-1">
                          <kbd className="px-2 py-1 text-xs font-mono font-semibold text-gray-100 bg-neutral-700 border border-neutral-600 rounded shadow-sm">
                            {key}
                          </kbd>
                          {keyIndex < shortcut.keys.length - 1 && (
                            <span className="text-gray-500 text-xs">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Footer note */}
          <div className="pt-4 border-t border-neutral-800">
            <p className="text-xs text-gray-500 text-center">
              Press <kbd className="px-1.5 py-0.5 text-xs font-mono bg-neutral-800 border border-neutral-700 rounded">?</kbd> anytime to show this dialog
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default KeyboardShortcutsModal;
