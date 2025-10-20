import React from 'react';

/**
 * Skip link component for keyboard accessibility
 * Allows keyboard users to skip navigation and jump directly to main content
 */
const SkipLink: React.FC = () => {
  return (
    <a
      href="#main-content"
      className="skip-link"
    >
      Skip to main content
    </a>
  );
};

export default SkipLink;
