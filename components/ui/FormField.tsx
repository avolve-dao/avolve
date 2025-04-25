import React from 'react';
import { CustomTooltip } from './CustomTooltip';

interface FormFieldProps {
  label: string;
  id: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'textarea';
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  tooltip?: string;
  error?: string;
  className?: string;
  autoComplete?: string;
  'aria-describedby'?: string;
}

/**
 * Standardized form field component with consistent styling and accessibility
 */
export const FormField: React.FC<FormFieldProps> = ({
  label,
  id,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  tooltip,
  error,
  className = "",
  autoComplete,
  'aria-describedby': ariaDescribedBy,
}) => {
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = ariaDescribedBy || errorId;
  
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1">
        <label 
          htmlFor={id} 
          className="block text-sm font-medium text-gray-700"
          id={`${id}-label`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {tooltip && <CustomTooltip content={tooltip} />}
      </div>
      
      {type === 'textarea' ? (
        <textarea
          id={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          aria-labelledby={`${id}-label`}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={`w-full px-3 py-2 border rounded-md font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500 
            ${error ? 'border-red-500' : 'border-gray-300'} 
            ${disabled ? 'bg-gray-100 text-gray-500' : ''} 
            ${className}`}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          aria-labelledby={`${id}-label`}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={`w-full px-3 py-2 border rounded-md font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500 
            ${error ? 'border-red-500' : 'border-gray-300'} 
            ${disabled ? 'bg-gray-100 text-gray-500' : ''} 
            ${className}`}
        />
      )}
      
      {error && (
        <p id={errorId} className="text-red-600 text-sm" aria-live="polite">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormField;
