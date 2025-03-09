import GroupCard from '../components/GroupCard'
import PageContainer from '../components/layout/PageContainer'
import PageHeader from '../components/layout/PageHeader'
import { getGroups } from '../services/groupService'

const Home = () => {
    const groups = getGroups()

    return (
        <PageContainer>
            <PageHeader title="Mes groupes" />
            
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
