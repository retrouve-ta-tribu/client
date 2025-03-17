import React from 'react';

/**
 * Props for the LocationUnavailable component that displays when location is not available
 * @property className - Optional CSS class name for styling the component
 */
interface LocationUnavailableProps {
  className?: string;
}

const LocationUnavailable: React.FC<LocationUnavailableProps> = ({ 
  className = 'text-sm text-gray-500' 
}) => {
  return (
    <div className={className}>
      <span className="inline-flex items-center">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-4 w-4 mr-1 text-gray-400" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path 
            fillRule="evenodd" 
            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" 
            clipRule="evenodd" 
          />
        </svg>
        Localisation non disponible
      </span>
    </div>
  );
};

export default LocationUnavailable; 