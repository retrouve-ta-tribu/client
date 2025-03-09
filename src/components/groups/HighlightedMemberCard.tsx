import React from 'react';
import MemberLocation from './MemberLocation';
import LocationUnavailable from './LocationUnavailable';
import MemberAvatar from './MemberAvatar';
import OnlineStatus from './OnlineStatus';
import {Member} from "./types.ts";
import {UserPosition} from "../../services/geolocationService.ts";

interface HighlightedMemberCardProps {
  member: Member;
  position?: UserPosition;
}

const HighlightedMemberCard: React.FC<HighlightedMemberCardProps> = ({ 
  member, 
  position 
}) => {
  const isOnline = !!position;
  
  return (
    <div className="mb-6 p-4 bg-blue-50 rounded-lg shadow-sm border border-blue-100">
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
              <MemberLocation position={position} large={true} />
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

export default HighlightedMemberCard; 