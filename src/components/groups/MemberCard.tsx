import React from 'react';
import MemberLocation from './MemberLocation';
import LocationUnavailable from './LocationUnavailable';
import OnlineStatus from './OnlineStatus';
import {Member, UserPosition} from "../../services/types.ts";
import DirectionVisualizer from "../sprunk/DirectionVisualizer.tsx";

/**
 * Props for the MemberCard component that displays member information
 * @property member - The member object containing information about the member
 * @property position - The user's position data including coordinates and timestamp
 * @property startPosition - The starting position for direction calculations
 * @property asList - Whether to render as a list item or div
 */
interface MemberCardProps {
  member: Member;
  position?: UserPosition;
  startPosition?: UserPosition;
}

const MemberCard: React.FC<MemberCardProps> = ({ 
  member, 
  position,
  startPosition,
}) => {
  const isOnline = !!position;
  
  const content = (
    <div className="flex items-center">
      <div className="mr-4">
        <img src={member.picture} alt={member.name} className="w-12 h-12 rounded-full" />
      </div>
      <div className="flex-1">
        <div className="flex items-center">
          <h3 className="font-medium text-gray-800">{member.name}</h3>
          <OnlineStatus isOnline={isOnline} />
        </div>
        <p className="text-xs text-gray-600">{member.email}</p>
        {position ? (
          <div className="mt-1">
            <MemberLocation position={position} startPosition={startPosition}/>
          </div>
        ) : (
          <div className="mt-1">
            <LocationUnavailable />
          </div>
        )}
      </div>
      <div>
        {position && startPosition && (
            <DirectionVisualizer position={position} startPosition={startPosition} />
        )}
      </div>
    </div>
  );
  
  return (
    <div className={`p-2 ${isOnline ? 'bg-green-50 border-green-200' : 'bg-gray-100 border-gray-200'} rounded-lg shadow-sm border`}>
      {content}
    </div>
  );
};

export default MemberCard; 