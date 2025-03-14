import React from 'react';
import MemberLocation from './MemberLocation';
import OnlineStatus from './OnlineStatus';
import {Member, UserPosition} from "../../services/types.ts";

interface MemberCardProps {
  member: Member;
  position?: UserPosition;
}

const MemberCard: React.FC<MemberCardProps> = ({ 
  member, 
  position, 
}) => {
  const isOnline = !!position;
  
  return (
    <li 
      className={`py-3 flex items-center`}
    >
      <div className="mr-3">
        <img src={member.picture} alt={member.name} className="w-8 h-8 rounded-full" />
      </div>
      <div className="flex-1">
        <div className="flex items-center">
          <span className="text-gray-800 block">
            {member.name}
          </span>
          <OnlineStatus isOnline={isOnline} />
        </div>
        <span className="text-xs text-gray-500 block">{member.email}</span>
        {position && <MemberLocation position={position} />}
      </div>
    </li>
  );
};

export default MemberCard; 