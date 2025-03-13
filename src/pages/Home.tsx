import { FC, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import GroupCard from '../components/GroupCard'
import PageContainer from '../components/layout/PageContainer'
import NavBar from '../components/layout/NavBar'
import { getGroups } from '../services/groupService'

const Home: FC = () => {
    const groups = getGroups()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('groups')

    const handleTabChange = (tab: string) => {
        setActiveTab(tab)
        if (tab === 'friends') {
            navigate('/friends')
        }
    }

    return (
        <PageContainer>
            <div className="flex flex-col h-full max-h-screen">
                <NavBar activeTab={activeTab} onTabChange={handleTabChange} />
                
                <div className="flex-grow overflow-y-auto">
                    <div className="divide-y divide-gray-100">
                        {groups.map((group, index) => (
                            <GroupCard 
                                key={`${group._id.$oid}-${index}`} 
                                group={group} 
                            />
                        ))}
                    </div>
                </div>
            </div>
        </PageContainer>
    )
}

export default Home 