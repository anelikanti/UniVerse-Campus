import React from 'react';

/**
 * @file components/LoadingSpinner.tsx
 * @brief Provides a reusable loading spinner component for indicating ongoing asynchronous operations.
 *
 * This component displays a visual spinner that animates to show that content is being loaded
 * or an action is being processed, enhancing the user experience during wait times.
 */

/**
 * `LoadingSpinner` is a functional React component that renders an animated loading spinner.
 * It uses Tailwind CSS classes for styling to create a visually appealing and accessible spinner.
 *
 * @returns {React.FC} The loading spinner component.
 */
const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center">
      {/* The spinner element, styled with Tailwind for animation and appearance. */}
      {/* `aria-label` or `role="status"` with a visually hidden text provides accessibility. */}
      <div
        className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] text-blue-500 motion-reduce:animate-[spin_1.5s_linear_infinite]"
        role="status" // Indicates to assistive technologies that this element is a live region for status updates.
        aria-label="Loading" // Provides an accessible label for the spinner.
      >
        {/* Visually hidden text for screen readers, ensuring accessibility for loading state. */}
        <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
          Loading...
        </span>
      </div>
    </div>
  );
};

export default LoadingSpinner;