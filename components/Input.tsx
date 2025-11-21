import React from 'react';

/**
 * @file components/Input.tsx
 * @brief Reusable Input component supporting text and textarea elements with labels and error messages.
 *
 * This component provides a standardized input field with accessibility features like labels
 * and integrated error display, ensuring consistent form element presentation and validation feedback.
 */

/**
 * Props for the `Input` component.
 * Extends standard HTML input/textarea attributes and adds custom properties for labels and errors.
 */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string; // Optional label text for the input field.
  id: string; // Unique identifier for the input, crucial for accessibility (connecting label to input).
  error?: string; // Optional error message to display below the input.
  as?: 'input' | 'textarea'; // Specifies whether to render an <input> or <textarea> element. Defaults to 'input'.
  rows?: number; // Number of rows for textarea (only applicable when `as` is 'textarea').
  cols?: number; // Number of columns for textarea (only applicable when `as` is 'textarea').
}

/**
 * `Input` is a functional React component that renders a customizable input field or textarea.
 * It includes support for labels, error messages, and dynamic styling based on validation state.
 *
 * @param {InputProps} props The properties passed to the component.
 * @returns {React.FC<InputProps>} The customizable input component.
 */
const Input: React.FC<InputProps> = ({
  label, // The text label displayed above the input.
  id, // The unique ID for the input element.
  error, // The error message string, if any, for validation feedback.
  as = 'input', // Determines if it's an 'input' or 'textarea'.
  className = '', // Additional CSS classes to apply to the input element.
  ...props // Any other standard HTML input/textarea attributes.
}) => {
  // Base styles applied to all input and textarea elements for consistent appearance.
  const baseStyles = 'block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm';
  // Styles applied when an error is present, highlighting the input in red.
  const errorStyles = 'border-red-500 focus:border-red-500 focus:ring-red-500';

  // Dynamically choose the HTML element type based on the `as` prop.
  const Element = as;

  return (
    <div className="mb-4">
      {/* Conditionally render a label if `label` prop is provided. */}
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      {/* Render the actual input or textarea element. */}
      <Element
        id={id} // Connects the label to the input for accessibility.
        // Dynamically compose CSS classes, applying error styles if `error` is present.
        className={`${baseStyles} ${error ? errorStyles : ''} ${className}`}
        {...props} // Spread any remaining HTML input/textarea attributes.
      />
      {/* Conditionally display the error message. */}
      {error && <p className="mt-1 text-sm text-red-600" aria-live="polite">{error}</p>}
    </div>
  );
};

export default Input;