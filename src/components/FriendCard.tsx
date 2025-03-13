import { FC, useState } from 'react';
import { Friend } from '../services/friendService';
import friendService from '../services/friendService';

interface FriendCardProps {
  friend: Friend;
  onRemove?: () => void;
}

const FriendCard: FC<FriendCardProps> = ({ friend, onRemove }) => {
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRemoving(true);
    setError(null);

    try {
      await friendService.removeFriend(friend.id);
      if (onRemove) {
        onRemove();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove friend');
      setIsRemoving(false);
    }
  };

  // Get the display name from the available properties
  const displayName = friend.displayName || 
    (friend.firstName && friend.lastName 
      ? `${friend.firstName} ${friend.lastName}` 
      : friend.email.split('@')[0]);

  return (
    <div className="flex items-center p-4 hover:bg-gray-50 border-b border-gray-100">
      <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
        <img 
          src={friend.picture} 
          alt={displayName}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-1">
        <h3 className="font-semibold text-gray-800">
          {displayName}
        </h3>
        <p className="text-sm text-gray-500">
          {friend.email}
        </p>
        {error && (
          <p className="text-xs text-red-500 mt-1">
            {error}
          </p>
        )}
      </div>

      <button
        onClick={handleRemove}
        disabled={isRemoving}
        className={`p-2 text-red-500 hover:text-red-700 focus:outline-none ${
          isRemoving ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        title="Supprimer cet ami"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};

export default FriendCard; 