import React from 'react';

interface OnlineStatusProps {
    isOnline: boolean;
}

const OnlineStatus: React.FC<OnlineStatusProps> = ({ isOnline }) => {
  if (!isOnline) return null;
  
  return (
    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
      Online
    </span>
  );
};

export default OnlineStatus; 