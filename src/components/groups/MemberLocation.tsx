import React from 'react';
import {Position, UserPosition} from "../../services/types.ts";
import worldCalculationService from "../../services/worldCalculationService.ts";

/**
 * Props for the MemberLocation component that displays a member's location
 * @property position - The position data which can be either a UserPosition or a regular Position
 * @property startPosition - The starting position for distance calculation (optional)
 * @property className - Optional CSS class name for styling the component
 * @property locationType - Type of location to display different colors ('default' or 'poi')
 */
interface MemberLocationProps {
  position?: UserPosition | Position;
  startPosition?: Position;
  locationType?: 'default' | 'poi';
}

const MemberLocation: React.FC<MemberLocationProps> = ({ 
  position, 
  startPosition,
  locationType = 'default',
}) => {
  // Calculate how recent the location update is
  const getTimeSinceUpdate = (): string => {
    // Check if position has timestamp property (indicating it's a UserPosition)
    if(!position || !('timestamp' in position)) return '';
    
    const now = Date.now();
    const secondsAgo = Math.floor((now - position.timestamp) / 1000);
    
    if (secondsAgo < 5) {
      return 'A l\'instant';
    } else if (secondsAgo < 60) {
      return `Il y a ${secondsAgo} secondes`;
    } else {
      const minutesAgo = Math.floor(secondsAgo / 60);
      return `Il y a ${minutesAgo} minute${minutesAgo === 1 ? '' : 's'}`;
    }
  };

  let iconColor = 'text-gray-400';
  if (position) {
    iconColor = locationType === 'poi' ? 'text-blue-500' : 'text-green-500';
  }
  
  // For a simple Position object without timestamp, only show distance
  const locationText = position 
    ? (startPosition ? `${Math.round(worldCalculationService.calculateDistance(startPosition, position))}m${('timestamp' in position) ? ` • ${getTimeSinceUpdate()}` : ''}` : ('timestamp' in position) ? getTimeSinceUpdate() : '')
    : 'Localisation non disponible';
  
  return (
    <div className={'mt-1 text-xs text-gray-500'}>
      <span className={'inline-flex items-center'}>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className={`h-3 w-3 mr-1 ${iconColor}`} 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path 
            fillRule="evenodd" 
            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" 
            clipRule="evenodd" 
          />
        </svg>
        <span>{locationText}</span>
      </span>
    </div>
  );
};

export default MemberLocation; 