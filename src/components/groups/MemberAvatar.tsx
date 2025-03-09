import React from 'react';

interface MemberAvatarProps {
  name: string;
  isOnline?: boolean;
  size?: 'sm' | 'lg';
}

const MemberAvatar: React.FC<MemberAvatarProps> = ({ 
  name, 
  isOnline = false,
  size = 'sm'
}) => {
  // Size classes
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    lg: 'w-12 h-12 text-lg font-medium'
  };
  
  // Color classes based on online status
  const colorClasses = isOnline 
    ? 'bg-green-100 text-green-500' 
    : size === 'lg' 
      ? 'bg-blue-100 text-blue-500' 
      : 'bg-gray-100 text-gray-500';
  
  return (
    <div className={`${sizeClasses[size]} rounded-full ${colorClasses} flex items-center justify-center`}>
      <span>
        {name.charAt(0)}
      </span>
    </div>
  );
};

export default MemberAvatar; 