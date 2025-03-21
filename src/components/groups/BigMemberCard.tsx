import React from 'react';
import MemberCard from './MemberCard';
import {Member, UserPosition} from "../../services/types.ts";

/**
 * Props for the BigMemberCard component that displays detailed member information
 * @property member - The member object containing information about the member
 * @property position - The user's position data including coordinates and timestamp
 * @property startPosition - The starting position for direction calculations
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
  return (
    <MemberCard 
      member={member}
      position={position}
      startPosition={startPosition}
    />
  );
};

export default BigMemberCard; 