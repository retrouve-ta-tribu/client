import { useParams, Link } from 'react-router-dom'
import { getGroupById } from '../services/groupService'

const GroupDetails = () => {
    const { id } = useParams()
    const group = getGroupById(id)

    if (!group) {
        return (
            <div className="max-w-2xl mx-auto bg-white shadow-sm min-h-screen p-4">
                <div className="flex items-center mb-4">
                    <Link to="/" className="text-blue-500 hover:text-blue-700 mr-2">
                        &larr; Back
                    </Link>
                </div>
                <div className="text-center py-10">
                    <h2 className="text-xl font-semibold text-gray-800">Group not found</h2>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto bg-white shadow-sm min-h-screen">
            <div className="border-b border-gray-200 p-4">
                <div className="flex items-center mb-2">
                    <Link to="/" className="text-blue-500 hover:text-blue-700 mr-2">
                        &larr; Back
                    </Link>
                </div>
                <h1 className="text-xl font-semibold text-gray-800">
                    {group.name}
                </h1>
                <p className="text-sm text-gray-500">
                    {group.members.length} members
                </p>
            </div>

            <div className="p-4">
                <h2 className="text-lg font-medium text-gray-700 mb-3">Members</h2>
                <ul className="divide-y divide-gray-100">
                    {group.members.map((member, index) => (
                        <li key={index} className="py-3 flex items-center">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                <span className="text-blue-500 text-sm">
                                    {member.charAt(0)}
                                </span>
                            </div>
                            <span className="text-gray-800">{member}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}

export default GroupDetails 