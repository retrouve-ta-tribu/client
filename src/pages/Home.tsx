import { FC } from 'react'
import { Link } from 'react-router-dom'
import GroupCard from '../components/GroupCard'
import PageContainer from '../components/layout/PageContainer'
import PageHeader from '../components/layout/PageHeader'
import { getGroups } from '../services/groupService'

const Home: FC = () => {
    const groups = getGroups()

    return (
        <PageContainer>
            <div className="flex flex-col h-full max-h-screen">
                <div className="flex-shrink-0">
                    <PageHeader title="Mes groupes" />
                </div>
                
                <div className="p-4 flex justify-end flex-shrink-0">
                    <Link 
                        to="/friends"
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        Mes amis
                    </Link>
                </div>
                
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