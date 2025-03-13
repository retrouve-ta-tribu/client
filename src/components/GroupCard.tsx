import { FC } from 'react'
import { Link } from 'react-router-dom'
import { Group } from '../services/groupService'

interface GroupCardProps {
    group: Group;
}

const GroupCard: FC<GroupCardProps> = ({ group }) => {
    // Format the date
    const formattedDate = group.createdAt?.$date 
        ? new Date(group.createdAt.$date).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
        : 'Date inconnue'

    // Get member count
    const memberCount = group.members?.length || 0

    return (
        <Link to={`/group/${group._id.$oid}`} className="block hover:bg-gray-50">
            <div className="p-4">
                <h3 className="font-semibold text-gray-800">{group.name}</h3>
                
                {group.description && (
                    <p className="text-sm text-gray-600 mt-1">{group.description}</p>
                )}
                
                <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                    <span>{memberCount} membre{memberCount > 1 ? 's' : ''}</span>
                    <span>Créé le {formattedDate}</span>
                </div>
            </div>
        </Link>
    )
}

export default GroupCard 