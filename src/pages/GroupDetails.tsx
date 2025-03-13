import { FC, useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import groupService, { Group } from '../services/groupService'
import PageContainer from '../components/layout/PageContainer'
import NavBar from '../components/layout/NavBar'
import Button from '../components/ui/Button'

const GroupDetails: FC = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [group, setGroup] = useState<Group | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState('groups')

    useEffect(() => {
        const loadGroup = async () => {
            if (!id) return
            
            setIsLoading(true)
            try {
                const groupData = await groupService.getGroupById(id)
                setGroup(groupData)
                if (!groupData) {
                    setError('Group not found')
                }
            } catch (err) {
                console.error('Failed to load group:', err)
                setError('Failed to load group details. Please try again later.')
            } finally {
                setIsLoading(false)
            }
        }

        loadGroup()
    }, [id])

    const handleTabChange = (tab: string) => {
        setActiveTab(tab)
        if (tab === 'friends') {
            navigate('/friends')
        } else if (tab === 'groups') {
            navigate('/')
        }
    }

    if (isLoading) {
        return (
            <PageContainer>
                <div className="flex flex-col h-full">
                    <NavBar activeTab={activeTab} onTabChange={handleTabChange} />
                    <div className="flex-grow flex items-center justify-center">
                        <p className="text-gray-500">Loading group details...</p>
                    </div>
                </div>
            </PageContainer>
        )
    }

    if (error || !group) {
        return (
            <PageContainer>
                <div className="flex flex-col h-full">
                    <NavBar activeTab={activeTab} onTabChange={handleTabChange} />
                    <div className="flex-grow flex flex-col items-center justify-center">
                        <p className="text-red-500 mb-4">{error || 'Group not found'}</p>
                        <Button 
                            variant="secondary"
                            onClick={() => navigate('/')}
                        >
                            Return to Groups
                        </Button>
                    </div>
                </div>
            </PageContainer>
        )
    }

    return (
        <PageContainer>
            <div className="flex flex-col h-full">
                <NavBar activeTab={activeTab} onTabChange={handleTabChange} />
                
                <div className="p-4 border-b border-gray-200">
                    <h1 className="text-2xl font-bold text-gray-800">{group.name}</h1>
                    {group.description && (
                        <p className="mt-2 text-gray-600">{group.description}</p>
                    )}
                </div>
                
                <div className="p-4">
                    <h2 className="text-lg font-semibold text-gray-700 mb-2">Members ({group.members.length})</h2>
                    
                    {group.members.length === 0 ? (
                        <p className="text-gray-500">No members in this group</p>
                    ) : (
                        <div className="space-y-2">
                            {/* We would need to fetch member details to display them properly */}
                            <p className="text-gray-500">Member list would be displayed here</p>
                        </div>
                    )}
                </div>
            </div>
        </PageContainer>
    )
}

export default GroupDetails 