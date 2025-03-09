import React from 'react';
import {UserPosition} from "../../services/types.ts";

interface MemberLocationProps {
  position: UserPosition;
  large?: boolean;
}

const MemberLocation: React.FC<MemberLocationProps> = ({ position, large = false }) => {
  // Format the coordinates to be more readable
  const formatCoordinate = (coord: number): string => {
    return coord.toFixed(6);
  };

  // Calculate how recent the location update is
  const getTimeSinceUpdate = (): string => {
    const now = Date.now();
    const secondsAgo = Math.floor((now - position.timestamp) / 1000);
    
    if (secondsAgo < 5) {
      return 'just now';
    } else if (secondsAgo < 60) {
      return `${secondsAgo} seconds ago`;
    } else {
      const minutesAgo = Math.floor(secondsAgo / 60);
      return `${minutesAgo} minute${minutesAgo === 1 ? '' : 's'} ago`;
    }
  };

  return (
    <div className={`mt-1 flex items-center ${large ? 'text-sm' : 'text-xs'} text-gray-500`}>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={`${large ? 'h-4 w-4' : 'h-3 w-3'} mr-1 text-green-500`} 
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
        {large ? (
          <>
            <strong>Location:</strong> {formatCoordinate(position.latitude)}, {formatCoordinate(position.longitude)}
            <br />
            <span className="ml-5">Updated {getTimeSinceUpdate()}</span>
          </>
        ) : (
          <>
            {formatCoordinate(position.latitude)}, {formatCoordinate(position.longitude)} • {getTimeSinceUpdate()}
          </>
        )}
      </span>
    </div>
  );
};

export default MemberLocation; 