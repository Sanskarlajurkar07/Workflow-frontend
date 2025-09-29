import React from 'react';

interface BasicTextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  className?: string;
}

export const BasicTextInput: React.FC<BasicTextInputProps> = ({
  value,
  onChange,
  placeholder = 'Enter text...',
  multiline = false,
  rows = 3,
  className = ''
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const baseClasses = [
    'w-full px-3 py-2 text-sm',
    'bg-white border-2 border-gray-300 rounded-lg',
    'text-black placeholder-gray-500',
    'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none',
    'transition-all duration-200',
    'relative z-50',  // Ensure high z-index
    className
  ].filter(Boolean).join(' ');

  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={handleChange}
        onMouseDown={handleMouseDown}
        onClick={handleClick}
        placeholder={placeholder}
        rows={rows}
        className={baseClasses}
        style={{ 
          resize: 'vertical', 
          minHeight: '80px',
          color: '#000000',
          backgroundColor: '#ffffff',
          position: 'relative',
          zIndex: 50
        }}
      />
    );
  }

  return (
    <input
      type="text"
      value={value}
      onChange={handleChange}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      placeholder={placeholder}
      className={baseClasses}
      style={{ 
        color: '#000000',
        backgroundColor: '#ffffff',
        position: 'relative',
        zIndex: 50
      }}
    />
  );
}; 