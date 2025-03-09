import { FC, useEffect, useState } from 'react';
import MemberLocation from './MemberLocation';
import Spinner from '../common/Spinner';
import { UserPosition } from '../../services/geolocationService';

interface Member {
  id: string;
  name: string;
  email: string;
}

interface MemberListProps {
  members: Member[];
  userPositions: UserPosition[];
  selectedMemberId?: string;
  onMemberSelect?: (memberId: string) => void;
}

const MemberList: FC<MemberListProps> = ({ members, userPositions = []  }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedUserId, setSelectedUserId] = useState<string>('')

  useEffect(() => {
    if (userPositions.length > 0) {
      setIsLoading(false);
    }
  }, [userPositions]);

  // Create a map of user positions by userId for quick lookup
  const positionMap: Record<string, UserPosition> = userPositions.reduce((map, position) => {
    map[position.userId] = position;
    return map;
  }, {} as Record<string, UserPosition>);

  // Get the selected user (either from props or from local state)
  const highlightedMember = selectedUserId ?
    members.find(m => m.id === selectedUserId) : null;
  const highlightedPosition = selectedUserId ?
    positionMap[selectedUserId] : null;

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
      
      {/* Highlighted Member Card */}
      {highlightedMember && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg shadow-sm border border-blue-100">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
              <span className="text-blue-500 text-lg font-medium">
                {highlightedMember.name.charAt(0)}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-800">{highlightedMember.name}</h3>
              <p className="text-sm text-gray-600">{highlightedMember.email}</p>
              {highlightedPosition ? (
                <div className="mt-2">
                  <MemberLocation position={highlightedPosition} large={true} />
                </div>
              ) : (
                <div className="mt-2 text-sm text-gray-500">
                  <span className="inline-flex items-center">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-4 w-4 mr-1 text-gray-400" 
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                    Location not available
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      <ul className="divide-y divide-gray-100">
        {members.map((member) => {
          const position = positionMap[member.id];
          const isOnline = !!position;
          const isHighlighted = member.id === selectedUserId;
          
          return (
            <li 
              key={member.id} 
              className={`py-3 flex items-center ${isHighlighted ? 'bg-blue-50' : ''} cursor-pointer hover:bg-gray-50`}
              onClick={() => setSelectedUserId(member.id)}
            >
              <div className={`w-8 h-8 rounded-full ${isOnline ? 'bg-green-100' : 'bg-gray-100'} flex items-center justify-center mr-3`}>
                <span className={`${isOnline ? 'text-green-500' : 'text-gray-500'} text-sm`}>
                  {member.name.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center">
                  <span className="text-gray-800 block">
                    {member.name}
                  </span>
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