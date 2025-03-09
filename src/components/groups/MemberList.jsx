import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import MemberLocation from './MemberLocation';
import Spinner from '../common/Spinner';

const MemberList = ({ members, userPositions = [] }) => {
  const [isLoading, setIsLoading] = useState(true);
  
  // Set loading to false after positions are received or after a timeout
  useEffect(() => {
    if (userPositions.length > 0) {
      setIsLoading(false);
    } else {
      // Set a timeout to stop showing loading state after 10 seconds
      // even if no positions are received
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [userPositions]);

  // Create a map of user positions by userId for quick lookup
  const positionMap = userPositions.reduce((map, position) => {
    map[position.userId] = position;
    return map;
  }, {});

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-medium text-gray-700">Members</h2>
        {isLoading && (
          <div className="flex items-center">
            <Spinner size="sm" color="blue" className="mr-2" />
            <span className="text-sm text-gray-500">Waiting for locations...</span>
          </div>
        )}
      </div>
      
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