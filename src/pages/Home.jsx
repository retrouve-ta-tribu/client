import GroupCard from '../components/GroupCard'
import { getGroups } from '../services/groupService'

const Home = () => {
    const groups = getGroups()

    return (
        <div className="max-w-2xl mx-auto bg-white shadow-sm min-h-screen">
            <div className="border-b border-gray-200 p-4">
                <h1 className="text-xl font-semibold text-gray-800">
                    Mes groupes
                </h1>
            </div>

            <div className="divide-y divide-gray-100">
                {groups.map((group) => (
                    <GroupCard 
                        key={group._id.$oid} 
                        group={group} 
                    />
                ))}
            </div>
        </div>
    )
}

export default Home
