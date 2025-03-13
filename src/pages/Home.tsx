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
            <PageHeader title="Mes groupes" />
            
            <div className="p-4 flex justify-end">
                <Link 
                    to="/friends"
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    Mes amis
                </Link>
            </div>
            
            <div className="divide-y divide-gray-100">
                {groups.map((group) => (
                    <GroupCard 
                        key={group._id.$oid} 
                        group={group} 
                    />
                ))}
            </div>
        </PageContainer>
    )
}

export default Home 