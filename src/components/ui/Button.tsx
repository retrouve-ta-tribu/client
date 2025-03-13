import { FC, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  isLoading?: boolean;
  loadingText?: string;
}

const Button: FC<ButtonProps> = ({
  children,
  variant = 'primary',
  isLoading = false,
  loadingText,
  disabled,
  className = '',
  ...props
}) => {
  const isDisabled = disabled || isLoading;
  
  const baseStyles = "px-4 py-2 rounded-md font-medium focus:outline-none transition-colors duration-200";
  
  const variantStyles = {
    primary: isDisabled 
      ? "bg-blue-300 text-white cursor-not-allowed" 
      : "bg-blue-500 text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer",
    secondary: isDisabled 
      ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
      : "bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 cursor-pointer"
  };
  
  const buttonStyles = `
    ${baseStyles} 
    ${variantStyles[variant]} 
    ${isDisabled ? 'opacity-70' : ''} 
    ${className}
  `.trim().replace(/\s+/g, ' ');
  
  return (
    <button
      disabled={isDisabled}
      className={buttonStyles}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{loadingText || 'Loading...'}</span>
        </div>
      ) : children}
    </button>
  );
};

export default Button; 