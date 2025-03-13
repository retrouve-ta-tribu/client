import { FC, useState } from 'react'
import { Link } from 'react-router-dom'
import { Group } from '../services/groupService'
import authService from '../services/authService'
import Button from './ui/Button'

interface GroupCardProps {
    group: Group;
    onLeave?: (groupId: string) => Promise<void>;
}

const GroupCard: FC<GroupCardProps> = ({ group, onLeave }) => {
    const [isLeaving, setIsLeaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const currentUserId = authService.state.profile?.id;

    const formatDate = (dateValue: any): string => {
        try {
            const dateString = typeof dateValue === 'string' ? dateValue : 
                              (dateValue?.$date || '');
            const date = new Date(dateString);
            return isNaN(date.getTime()) ? 'Date invalide' : 
                   date.toLocaleDateString('fr-FR', {year: 'numeric', month: 'long', day: 'numeric'});
        } catch {
            return 'Date inconnue';
        }
    };

    const formattedDate = formatDate(group.createdAt);
    const memberCount = group.members?.length || 0;

    const handleLeave = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!onLeave || !currentUserId) return;
        
        setIsLeaving(true);
        setError(null);
        
        try {
            await onLeave(group._id);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to leave group');
        } finally {
            setIsLeaving(false);
        }
    };

    return (
        <div className="relative">
            <Link to={`/group/${group._id}`} className="block hover:bg-gray-50">
                <div className="p-4">
                    <h3 className="font-semibold text-gray-800">{group.name}</h3>
                    
                    {group.description && (
                        <p className="text-sm text-gray-600 mt-1">{group.description}</p>
                    )}
                    
                    <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                        <span>{memberCount} membre{memberCount > 1 ? 's' : ''}</span>
                        <span>Créé le {formattedDate}</span>
                    </div>
                    
                    {error && (
                        <p className="text-xs text-red-500 mt-1">
                            {error}
                        </p>
                    )}
                </div>
            </Link>
            
            {onLeave && currentUserId && (
                <button
                    onClick={handleLeave}
                    disabled={isLeaving}
                    className={`absolute top-3 right-3 p-2 text-red-500 hover:text-red-700 focus:outline-none cursor-pointer ${
                        isLeaving ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    title="Quitter le groupe"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            )}
        </div>
    )
}

export default GroupCard 