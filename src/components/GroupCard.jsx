import { Link } from 'react-router-dom'

const GroupCard = ({ group }) => {
    return (
        <Link to={`/group/${group._id.$oid}`} className="block">
            <div className="flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                    <span className="text-gray-500 text-xl">
                        {group.name.charAt(0)}
                    </span>
                </div>

                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-gray-800">{group.name}</h3>
                    </div>
                    <p className="text-sm text-gray-500">
                        {group.members.length} members
                    </p>
                </div>
            </div>
        </Link>
    )
}

export default GroupCard
