import { FC, useEffect, useState } from 'react';
import Spinner from '../common/Spinner';
import { UserPosition } from '../../services/geolocationService';
import MemberCard from './MemberCard';
import HighlightedMemberCard from './HighlightedMemberCard';
import {Member} from './types';


export interface MemberListProps {
  members: Member[];
  userPositions: UserPosition[];
  selectedMemberId?: string;
  onMemberSelect?: (memberId: string) => void;
}
const MemberList: FC<MemberListProps> = ({
  members,
  userPositions = [],
  selectedMemberId,
  onMemberSelect
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedUserId, setSelectedUserId] = useState<string>(selectedMemberId || '');

  useEffect(() => {
    if (userPositions.length > 0) {
      setIsLoading(false);
    }
  }, [userPositions]);

  useEffect(() => {
    if (selectedMemberId) {
      setSelectedUserId(selectedMemberId);
    }
  }, [selectedMemberId]);

  // Create a map of user positions by userId for quick lookup
  const positionMap: Record<string, UserPosition> = userPositions.reduce((map, position) => {
    map[position.userId] = position;
    return map;
  }, {} as Record<string, UserPosition>);

  // Get the selected user (either from props or from local state)
  const highlightedMember = selectedUserId ?
    members.find(m => m.id === selectedUserId) : null;
  const highlightedPosition = selectedUserId ?
    positionMap[selectedUserId] : undefined;

  const handleMemberSelect = (memberId: string) => {
    setSelectedUserId(memberId);
    if (onMemberSelect) {
      onMemberSelect(memberId);
    }
  };

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
      
      <ul className="divide-y divide-gray-100">
        {members.map((member) => {
          const position = positionMap[member.id];
          const isHighlighted = member.id === selectedUserId;
          
          return (
            <MemberCard
              key={member.id}
              member={member}
              position={position}
              isHighlighted={isHighlighted}
              onClick={() => handleMemberSelect(member.id)}
            />
          );
        })}
      </ul>
    </div>
  );
};

export default MemberList; 