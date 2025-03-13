import { FC, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import GroupCard from '../components/GroupCard'
import PageContainer from '../components/layout/PageContainer'
import NavBar from '../components/layout/NavBar'
import Button from '../components/ui/Button'
import groupService, { Group } from '../services/groupService'
import authService from '../services/authService'

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
                const dateA = new Date(a.createdAt).getTime()
                const dateB = new Date(b.createdAt).getTime()
                return dateB - dateA
            })
            setGroups(sortedGroups)
        } catch (err) {
            console.error('Failed to load groups:', err)
            setError('Failed to load groups. Please try again later.')
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
        
        const apiUrl = import.meta.env.VITE_API_URL;
        if (!apiUrl) {
            throw new Error('API URL is not defined');
        }
        
        const response = await fetch(`${apiUrl}/api/groups/${groupId}/members/${currentUserId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
            throw new Error(errorData.message || `Failed to leave group: ${response.statusText}`);
        }
        
        // Refresh the groups list
        await loadGroups();
    };

    return (
        <PageContainer>
            <div className="flex flex-col h-full max-h-screen">
                <NavBar activeTab={activeTab} onTabChange={handleTabChange} />
                
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