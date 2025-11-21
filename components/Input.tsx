import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
  id: string;
  error?: string;
  as?: 'input' | 'textarea';
  // Add rows and cols for textarea support
  rows?: number;
  cols?: number;
}

const Input: React.FC<InputProps> = ({ label, id, error, as = 'input', className = '', ...props }) => {
  const baseStyles = 'block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm';
  const errorStyles = 'border-red-500 focus:border-red-500 focus:ring-red-500';

  const Element = as;

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <Element
        id={id}
        className={`${baseStyles} ${error ? errorStyles : ''} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Input;