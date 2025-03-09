import { Link } from 'react-router-dom';
import MemberLocation from './MemberLocation';

const MemberList = ({ members, userPositions = [] }) => {
  // Create a map of user positions by userId for quick lookup
  const positionMap = userPositions.reduce((map, position) => {
    map[position.userId] = position;
    return map;
  }, {});

  return (
    <div>
      <h2 className="text-lg font-medium text-gray-700 mb-3">Members</h2>
      <ul className="divide-y divide-gray-100">
        {members.map((member) => {
          const position = positionMap[member.id];
          const isOnline = !!position;
          
          return (
            <li key={member.id} className="py-3 flex items-center">
              <div className={`w-8 h-8 rounded-full ${isOnline ? 'bg-green-100' : 'bg-blue-100'} flex items-center justify-center mr-3`}>
                <span className={`${isOnline ? 'text-green-500' : 'text-blue-500'} text-sm`}>
                  {member.name.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center">
                  <Link 
                    to={`/user/${member.id}`} 
                    className="text-gray-800 hover:text-blue-600 block"
                  >
                    {member.name}
                  </Link>
                  {isOnline && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      Online
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500 block">{member.email}</span>
                {position && <MemberLocation position={position} />}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default MemberList; 