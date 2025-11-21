import React from 'react';

/**
 * @file components/Button.tsx
 * @brief Reusable Button component with different styles, sizes, and loading states.
 *
 * This component provides a standardized button implementation, supporting various
 * visual treatments (primary, secondary, danger), sizes (small, medium, large),
 * and a built-in loading indicator, enhancing UI consistency and user feedback.
 */

/**
 * Props for the `Button` component.
 * Extends standard HTML button attributes and adds custom styling and state properties.
 */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'; // Visual style of the button.
  size?: 'sm' | 'md' | 'lg'; // Size of the button.
  loading?: boolean; // If true, displays a loading spinner and disables the button.
}

/**
 * `Button` is a functional React component that renders a customizable button.
 * It integrates with Tailwind CSS for styling and handles loading states.
 *
 * @param {ButtonProps} props The properties passed to the component.
 * @returns {React.FC<ButtonProps>} The customizable button component.
 */
const Button: React.FC<ButtonProps> = ({
  children, // Content to be rendered inside the button (e.g., text, icons).
  variant = 'primary', // Default variant is 'primary'.
  size = 'md', // Default size is 'md'.
  loading = false, // Default loading state is false.
  className = '', // Additional CSS classes to apply.
  disabled, // Standard HTML disabled attribute.
  ...props // Any other standard button attributes.
}) => {
  // Base styles applied to all buttons for consistent appearance and behavior.
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2';

  // Styles specific to each button variant.
  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };

  // Styles specific to each button size.
  const sizeStyles = {
    sm: 'px-2.5 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-2.5 text-lg',
  };

  // Styles applied when the button is disabled or in a loading state.
  const disabledStyles = 'opacity-50 cursor-not-allowed';

  return (
    <button
      // Dynamically compose CSS classes based on props.
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${
        (disabled || loading) ? disabledStyles : ''
      } ${className}`}
      // Disable the button if `disabled` prop is true or if `loading` is true.
      disabled={disabled || loading}
      {...props} // Spread any remaining HTML button attributes.
    >
      {/* Conditionally render a loading spinner or the button's children. */}
      {loading ? (
        // Loading spinner, styled with Tailwind for animation.
        <span className="block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent" aria-hidden="true"></span>
      ) : (
        children // Render the children content when not loading.
      )}
    </button>
  );
};

export default Button;