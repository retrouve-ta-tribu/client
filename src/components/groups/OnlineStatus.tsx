import React from 'react';

/**
 * Props for the OnlineStatus component that displays a member's online status
 * @property isOnline - Boolean indicating if the member is currently online
 */
interface OnlineStatusProps {
    isOnline: boolean;
}

const OnlineStatus: React.FC<OnlineStatusProps> = ({ isOnline }) => {
  
  return (
    <span className={`ml-2 hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${isOnline ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-800'}`}>
      {isOnline ? 'En ligne' : 'Hors ligne'}
    </span>
  );
};

export default OnlineStatus; 