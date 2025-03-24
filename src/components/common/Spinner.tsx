import { FC } from 'react';

/**
 * A reusable spinner component for loading states
 */
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

const Spinner: FC<SpinnerProps> = ({ size = 'md', color = 'blue', className = '' }) => {
  // Map size to width and height classes
  const sizeMap: Record<string, string> = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };
  
  const sizeClass = sizeMap[size] || sizeMap.md;
  
  return (
    <div 
      className={`spinner-border animate-spin inline-block ${sizeClass} rounded-full text-${color}-500 border-current border-r-transparent ${className}`} 
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Spinner; 