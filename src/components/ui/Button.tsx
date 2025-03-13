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
  const baseStyles = "px-4 py-2 rounded-md font-medium focus:outline-none transition-colors duration-200 cursor-pointer";
  
  const variantStyles = {
    primary: "bg-blue-500 text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
    secondary: "bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
  };
  
  const disabledStyles = "opacity-50 cursor-not-allowed";
  
  const buttonStyles = `
    ${baseStyles} 
    ${variantStyles[variant]} 
    ${(disabled || isLoading) ? disabledStyles : ''} 
    ${className}
  `;
  
  return (
    <button
      disabled={disabled || isLoading}
      className={buttonStyles}
      {...props}
    >
      {isLoading ? (loadingText || 'Loading...') : children}
    </button>
  );
};

export default Button; 