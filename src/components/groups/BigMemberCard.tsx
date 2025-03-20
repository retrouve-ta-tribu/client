import React from 'react';
import MemberLocation from './MemberLocation.tsx';
import LocationUnavailable from './LocationUnavailable.tsx';
import OnlineStatus from './OnlineStatus.tsx';
import {Member, UserPosition} from "../../services/types.ts";
import DirectionVisualizer from "../sprunk/DirectionVisualizer.tsx";

/**
 * Props for the BigMemberCard component that displays detailed member information
 * @property member - The member object containing information about the member
 * @property position - The user's position data including coordinates and timestamp
 */
interface BigMemberCardProps {
  member: Member;
  position?: UserPosition;
  startPosition?: UserPosition;
}

const BigMemberCard: React.FC<BigMemberCardProps> = ({ 
  member, 
  position,
  startPosition
}) => {
  const isOnline = !!position;

  return (
    <div className={`p-2 ${isOnline ? 'bg-green-50 border-green-200' : 'bg-gray-100 border-gray-200'} rounded-lg shadow-sm border`}>
      <div className="flex items-center">
        <div className="mr-4">
          <img src={member.picture} alt={member.name} className="w-12 h-12 rounded-full" />
        </div>
        <div className="flex-1">
          <div className="flex items-center">
            <h3 className="text-lg font-medium text-gray-800">{member.name}</h3>
            <OnlineStatus isOnline={isOnline} />
          </div>
          <p className="text-sm text-gray-600">{member.email}</p>
          {position ? (
            <div className="mt-2">
              <MemberLocation position={position} />
            </div>
          ) : (
            <div className="mt-2">
              <LocationUnavailable />
            </div>
          )}
        </div>
        <div>
          <DirectionVisualizer position={position} startPosition={startPosition}/>
        </div>
      </div>
    </div>
  );
};

export default BigMemberCard; 