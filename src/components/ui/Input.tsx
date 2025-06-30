import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({ label, error, icon, className = '', ...props }: InputProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
            {icon}
          </div>
        )}
        <input
          className={`
            w-full p-2 ${icon ? 'pl-10' : ''} border border-gray-300 dark:border-gray-600 rounded-lg text-sm
            focus:ring-2 focus:ring-green-500 focus:border-transparent
            transition-all duration-200 bg-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500
            text-gray-900 dark:text-white
            hover:border-gray-400 dark:hover:border-gray-500
            ${error ? 'border-red-500 focus:ring-red-500' : ''}
            ${props.disabled ? 'bg-gray-50 dark:bg-gray-800 cursor-not-allowed opacity-60' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
      )}
    </div>
  );
}