import { useParams, Link } from 'react-router-dom'
import { getUserById } from '../services/groupService'

const UserDetails = () => {
    const { id } = useParams()
    const user = getUserById(id)

    if (!user) {
        return (
            <div className="max-w-2xl mx-auto bg-white shadow-sm min-h-screen p-4">
                <div className="flex items-center mb-4">
                    <Link to="/" className="text-blue-500 hover:text-blue-700 mr-2">
                        &larr; Back
                    </Link>
                </div>
                <div className="text-center py-10">
                    <h2 className="text-xl font-semibold text-gray-800">User not found</h2>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto bg-white shadow-sm min-h-screen">
            <div className="border-b border-gray-200 p-4">
                <div className="flex items-center mb-2">
                    <Link to={`/group/${user.groupId}`} className="text-blue-500 hover:text-blue-700 mr-2">
                        &larr; Back to {user.groupName}
                    </Link>
                </div>
            </div>

            <div className="p-6">
                <div className="flex items-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                        <span className="text-blue-500 text-2xl">
                            {user.name.charAt(0)}
                        </span>
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-800">{user.name}</h1>
                        <p className="text-sm text-gray-500">Member of {user.groupName}</p>
                    </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <h2 className="text-lg font-medium text-gray-700 mb-2">Contact</h2>
                    <p className="text-gray-600">
                        <span className="font-medium">Email:</span> {user.email}
                    </p>
                </div>
            </div>
        </div>
    )
}

export default UserDetails 