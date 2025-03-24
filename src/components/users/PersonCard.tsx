import { FC, useState } from 'react';
import { Member } from '../../services/types';

/**
 * Props for the PersonCard component that displays person information with actions
 * @property person - The person object containing information about the person
 * @property onRemove - The function to call when the remove button is clicked
 * @property onClick - The function to call when the card is clicked
 * @property showRemoveButton - Whether to show the remove button
 * @property compact - Whether to show the compact version of the card
 */
interface PersonCardProps {
  person;
  onRemove?: () => void;
  onClick?: () => void;
  showRemoveButton?: boolean;
  compact?: boolean;
}

const PersonCard: FC<PersonCardProps> = ({ 
  person, 
  onRemove, 
  onClick, 
  showRemoveButton = true,
  compact = false 
}) => {
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRemoving(true);
    setError(null);
    
    try {
      if (onRemove) {
        onRemove();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove');
      setIsRemoving(false);
    }
  };

  // Get the display name from the available properties
  const displayName = person.displayName || 
    (person.firstName && person.lastName 
      ? `${person.firstName} ${person.lastName}` 
      : person.email.split('@')[0]);

  const cardClasses = compact 
    ? "flex items-center justify-between bg-gray-50 p-2 rounded w-full"
    : "flex items-center p-4 hover:bg-gray-50 border-b border-gray-100 w-full";

  return (
    <div 
      className={cardClasses + " cursor-pointer hover:bg-gray-100"}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex items-center flex-grow min-w-0">
        <div className={`${compact ? 'w-8 h-8' : 'w-12 h-12'} rounded-full overflow-hidden flex-shrink-0 mr-4`}>
          <img 
            src={person.picture} 
            alt={displayName}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-grow min-w-0">
          <div className={`${compact ? 'font-medium' : 'font-semibold text-gray-800'} truncate`}>
            {displayName}
          </div>
          <div className={`${compact ? 'text-xs text-gray-500' : 'text-sm text-gray-500'} truncate`}>
            {person.email}
          </div>
          {error && (
            <p className="text-xs text-red-500 mt-1 truncate">
              {error}
            </p>
          )}
        </div>
      </div>

      {showRemoveButton && (
        <button
          onClick={handleRemove}
          disabled={isRemoving}
          className={`p-2 text-red-500 hover:text-red-700 focus:outline-none cursor-pointer flex-shrink-0 ${
            isRemoving ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          title="Supprimer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default PersonCard; 