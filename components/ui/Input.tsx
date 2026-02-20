import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all duration-200 
        bg-surface 
        text-slate-900 dark:text-white
        placeholder-slate-400 dark:placeholder-slate-500
        [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
        ${error
            ? 'border-red-300 dark:border-red-800 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-900/30'
            : 'border-slate-200 dark:border-slate-700 focus:border-primary-500 focus:ring-primary-100 dark:focus:ring-primary-900/30'
          } ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};