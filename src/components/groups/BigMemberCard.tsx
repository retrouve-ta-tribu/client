import React from 'react';
import MemberLocation from './MemberLocation.tsx';
import LocationUnavailable from './LocationUnavailable.tsx';
import MemberAvatar from './MemberAvatar.tsx';
import OnlineStatus from './OnlineStatus.tsx';
import {Member, UserPosition} from "../../services/types.ts";

interface BigMemberCardProps {
  member: Member;
  position?: UserPosition;
}

const BigMemberCard: React.FC<BigMemberCardProps> = ({ 
  member, 
  position 
}) => {
  const isOnline = !!position;
  
  return (
    <div className={`p-4 ${isOnline ? 'bg-green-50 border-green-200' : 'bg-gray-100 border-gray-200'} rounded-lg shadow-sm border`}>
      <div className="flex items-center">
        <div className="mr-4">
          <MemberAvatar name={member.name} isOnline={isOnline} size="lg" />
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
      </div>
    </div>
  );
};

export default BigMemberCard; 