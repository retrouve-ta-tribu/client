import React from 'react';

interface OnlineStatusProps {
    isOnline: boolean;
}

const OnlineStatus: React.FC<OnlineStatusProps> = ({ isOnline }) => {
  
  return (
    <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${isOnline ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-800'}`}>
      {isOnline ? 'Online' : 'Offline'}
    </span>
  );
};

export default OnlineStatus; 