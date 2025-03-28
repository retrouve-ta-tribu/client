import { FC, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import GroupCard from '../components/groups/GroupCard'
import PageContainer from '../components/layout/PageContainer'
import NavBar from '../components/layout/NavBar'
import Button from '../components/common/Button'
import groupService, { Group } from '../services/groupService'
import authService from '../services/authService'
import PermissionsRequest from '../components/permissions/PermissionsRequest'

// MongoDB date format type
interface MongoDBDate {
    $date: string;
}

type DateValue = string | MongoDBDate | Date;

const Home: FC = () => {
    const [groups, setGroups] = useState<Group[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('groups')

    const loadGroups = async () => {
        setIsLoading(true)
        try {
            const groupsList = await groupService.getGroups()
            // Sort groups by creation date (newest first)
            const sortedGroups = [...groupsList].sort((a, b) => {
                // Handle MongoDB date format which may be a string or an object with $date property
                const getTimestamp = (date: DateValue): number => {
                    if (typeof date === 'string') {
                        return new Date(date).getTime();
                    } else if (date && typeof date === 'object' && '$date' in date) {
                        return new Date(date.$date).getTime();
                    } else if (date instanceof Date) {
                        return date.getTime();
                    }
                    return 0;
                };
                
                const dateA = getTimestamp(a.createdAt);
                const dateB = getTimestamp(b.createdAt);
                return dateB - dateA;
            })
            setGroups(sortedGroups)
        } catch (err) {
            console.error('Impossible de charger les groupes:', err)
            setError('Impossible de charger les groupes. Veuillez réessayer plus tard.')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadGroups()
    }, [])

    const handleTabChange = (tab: string) => {
        setActiveTab(tab)
        if (tab === 'friends') {
            navigate('/friends')
        }
    }

    const handleCreateGroup = () => {
        navigate('/create-group')
    }

    const handleLeaveGroup = async (groupId: string) => {
        const currentUserId = authService.state.profile?.id;
        if (!currentUserId) {
            throw new Error('You must be logged in to leave a group');
        }
        
       await groupService.leaveGroup(groupId, currentUserId);
        
       await loadGroups();
    };

    return (
        <PageContainer>
            <div className="flex flex-col h-full max-h-screen">
                <NavBar activeTab={activeTab} onTabChange={handleTabChange} />
                
                <div className="p-4">
                    <PermissionsRequest />
                </div>
                
                <div className="p-4 flex-shrink-0">
                    <Button 
                        variant="bordered"
                        className="w-full"
                        onClick={handleCreateGroup}
                    >
                        Créer un groupe
                    </Button>
                </div>
                
                <div className="flex-grow overflow-y-auto">
                    {isLoading ? (
                        <div className="p-4 text-center text-gray-500">Chargement...</div>
                    ) : error ? (
                        <div className="p-4 text-center text-red-500">{error}</div>
                    ) : groups.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">Vous n'avez pas encore de groupes</div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {groups.map((group, index) => (
                                <GroupCard 
                                    key={`${group._id}-${index}`} 
                                    group={group} 
                                    onLeave={handleLeaveGroup}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </PageContainer>
    )
}

export default Home 