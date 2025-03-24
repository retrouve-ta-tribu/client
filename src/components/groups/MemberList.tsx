import { FC, useEffect, useState } from 'react';
import Spinner from '../common/Spinner';
import MemberCard from './MemberCard';
import { Member, UserPosition } from '../../services/types';
import authService from '../../services/authService';
import 'leaflet/dist/leaflet.css';

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
        {isLoading && (
          <div className="flex items-center">
            <Spinner size="sm" color="blue" className="mr-2" />
            <span className="text-sm text-gray-500">En attente de localisations...</span>
          </div>
        )}
      </div>
      
      {/* Highlighted Member Card */}
      {highlightedMember && (
        <MemberCard 
          member={highlightedMember} 
          position={highlightedPosition} 
        />
      )}


      <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-2 flex flex-col gap-2 mt-4">
        {members.map((member) => {
          const position = positionMap[member.id];
          if (!authService.state.profile?.id) return;
          if (member.id === authService.state.profile?.id) return;
          const startPosition = positionMap[authService.state.profile?.id];
          
          return (
            <MemberCard
              key={member.id}
              member={member}
              position={position}
              startPosition={startPosition}
            />
          );
        })}
      </div>
    </div>
  );
};

export default MemberList; 