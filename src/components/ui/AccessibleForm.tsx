import React, { FormEvent, ReactNode } from 'react';

interface FormProps {
  onSubmit: (e: FormEvent) => void;
  children: ReactNode;
  ariaLabel: string;
  ariaDescribedBy?: string;
  className?: string;
}

export const AccessibleForm: React.FC<FormProps> = ({
  onSubmit,
  children,
  ariaLabel,
  ariaDescribedBy,
  className = '',
}) => {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(e);
      }}
      className={className}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      noValidate
    >
      {children}
    </form>
  );
};

interface InputProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  error?: string;
  placeholder?: string;
  autoComplete?: string;
  className?: string;
}

export const AccessibleInput: React.FC<InputProps> = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  required = false,
  error,
  placeholder = '',
  autoComplete,
  className = '',
}) => {
  const inputId = `input-${id}`;
  const errorId = `error-${id}`;
  const hasError = !!error;

  return (
    <div className={`mb-4 ${className}`}>
      <label 
        htmlFor={inputId}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
        {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
      </label>
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={onChange}
        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3AAFA9] ${
          hasError ? 'border-red-500' : 'border-gray-300'
        }`}
        aria-invalid={hasError}
        aria-describedby={hasError ? errorId : undefined}
        aria-required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
      />
      {hasError && (
        <div id={errorId} className="mt-1 text-sm text-red-500" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};

interface ButtonProps {
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  children: ReactNode;
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger';
}

export const AccessibleButton: React.FC<ButtonProps> = ({
  type = 'button',
  onClick,
  children,
  disabled = false,
  ariaLabel,
  className = '',
  variant = 'primary',
}) => {
  const baseClasses = 'px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-[#3AAFA9] text-white hover:bg-[#2B7A78] focus:ring-[#3AAFA9]',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };
  
  const disabledClasses = 'opacity-50 cursor-not-allowed';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${disabled ? disabledClasses : ''} ${className}`}
    >
      {children}
    </button>
  );
}; 