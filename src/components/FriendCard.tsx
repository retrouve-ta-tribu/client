import { FC } from 'react';
import { Friend } from '../services/friendService';

interface FriendCardProps {
  friend: Friend;
}

const FriendCard: FC<FriendCardProps> = ({ friend }) => {
  return (
    <div className="flex items-center p-4 hover:bg-gray-50 border-b border-gray-100">
      <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
        <img 
          src={friend.picture} 
          alt={`${friend.firstName} ${friend.lastName}`}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-1">
        <h3 className="font-semibold text-gray-800">
          {friend.firstName} {friend.lastName}
        </h3>
        <p className="text-sm text-gray-500">
          {friend.email}
        </p>
      </div>
    </div>
  );
};

export default FriendCard; 