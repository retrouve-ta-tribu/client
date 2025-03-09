import { Link } from 'react-router-dom';

const MemberList = ({ members }) => {
  return (
    <div>
      <h2 className="text-lg font-medium text-gray-700 mb-3">Members</h2>
      <ul className="divide-y divide-gray-100">
        {members.map((member) => (
          <li key={member.id} className="py-3 flex items-center">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
              <span className="text-blue-500 text-sm">
                {member.name.charAt(0)}
              </span>
            </div>
            <div className="flex-1">
              <Link 
                to={`/user/${member.id}`} 
                className="text-gray-800 hover:text-blue-600 block"
              >
                {member.name}
              </Link>
              <span className="text-xs text-gray-500">{member.email}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MemberList; 