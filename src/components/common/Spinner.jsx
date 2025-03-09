import React from 'react';

/**
 * A reusable spinner component for loading states
 * @param {Object} props Component props
 * @param {string} props.size Size of the spinner ('sm', 'md', 'lg')
 * @param {string} props.color Color of the spinner ('blue', 'green', 'red', etc.)
 * @param {string} props.className Additional CSS classes
 * @returns {JSX.Element} Spinner component
 */
const Spinner = ({ size = 'md', color = 'blue', className = '' }) => {
  // Map size to width and height classes
  const sizeMap = {
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