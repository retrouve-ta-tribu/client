import { FC, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import GroupCard from '../components/GroupCard'
import PageContainer from '../components/layout/PageContainer'
import NavBar from '../components/layout/NavBar'
import Button from '../components/ui/Button'
import groupService, { Group } from '../services/groupService'

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
            setGroups(groupsList)
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
                                    key={`${group._id.$oid}-${index}`} 
                                    group={group} 
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