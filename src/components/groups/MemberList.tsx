import { FC, useEffect, useState } from 'react';
import Spinner from '../common/Spinner';
import MemberCard from './MemberCard';
import BigMemberCard from './BigMemberCard';
import { Member, UserPosition } from '../../services/types';
import authService from '../../services/authService';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
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

  const createCustomMarker = (name: string) => {
    return L.divIcon({
      className: 'custom-marker', // Classe CSS pour le style
      html: `
      <div style="text-align: center; display: flex; flex-direction: column; align-items: center;">
        <img src="/marker-icon.png" alt="Marker" style="width: 25px; height: 41px;"/>
        <div style="margin-top: 5px; font-size: 12px; color: black; white-space: nowrap;">${name}</div>
      </div>
    `,
      iconSize: [25, 41], // Taille de l'icône
      iconAnchor: [12, 41], // Point d'ancrage de l'icône
    });
  };

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
        <h2 className="text-lg font-medium text-gray-700">Membres</h2>
        {isLoading && (
          <div className="flex items-center">
            <Spinner size="sm" color="blue" className="mr-2" />
            <span className="text-sm text-gray-500">Waiting for locations...</span>
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

      <div className="mt-4 flex flex-col gap-2">
        {members.map((member) => {
          const position = positionMap[member.id];
          if (member.id === authService.state.profile?.id) return;
          
          return (
            <BigMemberCard
              key={member.id}
              member={member}
              position={position}
            />
          );
        })}
      </div>

      <MapContainer center={[48.8566, 2.3522]} zoom={5} style={{ height: '400px', width: '100%' }}>
        <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {userPositions.map((position, index) => (
            <Marker
                key={index}
                position={[position.latitude, position.longitude]}
                icon={createCustomMarker(members[index].name)} // Utiliser le marqueur personnalisé
            >
            </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MemberList; 