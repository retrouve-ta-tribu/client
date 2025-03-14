import { FC, useEffect, useState } from 'react';
import Spinner from '../common/Spinner';
import MemberCard from './MemberCard';
import HighlightedMemberCard from './HighlightedMemberCard';
import {Member, UserPosition} from '../../services/types.ts';
import authService from '../../services/authService';


export interface MemberListProps {
  members: Member[];
  userPositions: UserPosition[];
}
const MemberList: FC<MemberListProps> = ({
  members = [],
  userPositions = [],
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);

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
  const highlightedMember = authService.state.profile?.id ?
    members.find(m => m.id === authService.state.profile?.id) : null;
  const highlightedPosition = authService.state.profile?.id ?
    positionMap[authService.state.profile?.id] : undefined;

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
        <HighlightedMemberCard 
          member={highlightedMember} 
          position={highlightedPosition} 
        />
      )}

        {members.map((member) => {
          const position = positionMap[member.id];
          if (member.id === authService.state.profile?.id) return;
          
          return (
            <MemberCard
              key={member.id}
              member={member}
              position={position}
            />
          );
        })}
    </div>
  );
};

export default MemberList; 