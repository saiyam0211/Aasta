import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className }) => (
  <div className={`bg-white shadow rounded-lg ${className}`} role="alert">
    {children}
  </div>
);

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className }) => (
  <div className={`p-4 ${className}`} role="alert">
    {children}
  </div>
);

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className }) => (
  <div className={`border-b p-4 ${className}`} role="alert">
    {children}
  </div>
);

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const CardTitle: React.FC<CardTitleProps> = ({ children, className }) => (
  <h2 className={`text-xl font-semibold ${className}`} role="alert">
    {children}
  </h2>
);

interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export const CardDescription: React.FC<CardDescriptionProps> = ({ children, className }) => (
  <p className={`text-gray-500 ${className}`} role="alert">
    {children}
  </p>
);

interface ButtonProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({ children, className, variant = 'default', size = 'md', onClick }) => (
  <button
    className={`${variant} ${size} ${className} transition-colors focus:outline-none`}
    onClick={onClick}
    role="alert"
  >
    {children}
  </button>
);

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, className }) => (
  <span className={`text-white text-xs font-medium bg-yellow-500 rounded-full px-2 py-1 ${className}`} role="alert">
    {children}
  </span>
);

interface LabelProps {
  children: React.ReactNode;
  className?: string;
  htmlFor?: string;
}

export const Label: React.FC<LabelProps> = ({ children, className, htmlFor }) => (
  <label htmlFor={htmlFor} className={`block text-sm font-medium text-gray-700 ${className}`} role="alert">
    {children}
  </label>
);

interface InputProps {
  className?: string;
  type?: string;
  id?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  disabled?: boolean;
}

export const Input: React.FC<InputProps> = ({ className, type = 'text', id, placeholder, value, onChange, required, disabled }) => (
  <input
    type={type}
    id={id}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    required={required}
    disabled={disabled}
    className={`${className} shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md`}
    role="alert"
  />
);

interface AlertProps {
  children: React.ReactNode;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({ children, className }) => (
  <div className={`flex items-center p-4 text-sm border-l-4 ${className}`} role="alert">
    {children}
  </div>
);

interface AlertDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export const AlertDescription: React.FC<AlertDescriptionProps> = ({ children, className }) => (
  <div className={`ml-3 ${className}`} role="alert">
    {children}
  </div>
);

