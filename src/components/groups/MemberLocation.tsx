import React from 'react';
import {Position, UserPosition} from "../../services/types.ts";
import worldCalculationService from "../../services/worldCalculationService.ts";

/**
 * Props for the MemberLocation component that displays a member's location
 * @property position - The user's position data including coordinates and timestamp
 */
interface MemberLocationProps {
  position: UserPosition;
  startPosition?: Position;
}

const MemberLocation: React.FC<MemberLocationProps> = ({ position, startPosition }) => {
  // Calculate how recent the location update is
  const getTimeSinceUpdate = (): string => {
    if(!position.timestamp) return '';
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

  return (
    <div className={`mt-1 flex items-center text-xs text-gray-500`}>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={`h-3 w-3 mr-1 text-green-500`} 
        viewBox="0 0 20 20" 
        fill="currentColor"
      >
        <path 
          fillRule="evenodd" 
          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" 
          clipRule="evenodd" 
        />
      </svg>
      <span>
        {startPosition && position
            ? `${Math.round(worldCalculationService.calculateDistance(startPosition, position))}m • ${getTimeSinceUpdate()}`
            : getTimeSinceUpdate() }
      </span>
    </div>
  );
};

export default MemberLocation; 