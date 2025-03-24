import { FC, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, ZoomControl, Tooltip, Popup } from 'react-leaflet';
import L from "leaflet";
import { Member, PointOfInterest, UserPosition } from "../../services/types";
import worldCalculationService from '../../services/worldCalculationService';
import authService from '../../services/authService';

interface GroupMapProps {
    userPositions: UserPosition[];
    points: PointOfInterest[];
    memberObjects: Member[];
    groupId: string;
    onPointAdd: (name: string, lat: number, lng: number) => Promise<void>;
    onPointRemove?: (pointId: string) => Promise<void>;
}

const GroupMap: FC<GroupMapProps> = ({ 
    userPositions, 
    points, 
    memberObjects,
    onPointAdd,
    onPointRemove
}) => {
    const [isAdding, setIsAdding] = useState<boolean>(false);
    const [selectedPoint, setSelectedPoint] = useState<PointOfInterest | null>(null);

    // Get current user position to calculate distance
    const getCurrentUserPosition = () => {
        const currentUserId = authService.state.profile?.id;
        if (!currentUserId) return null;
        
        const userPosition = userPositions.find(pos => pos.userId === currentUserId);
        return userPosition || null;
    };

    const createCustomPersonMarker = (name: string) => {
        return L.divIcon({
            className: 'custom-marker',
            html: `
      <div style="text-align: center; display: flex; flex-direction: column; align-items: center;">
        <div style="background-color:oklch(0.723 0.219 149.579); border-radius: 50%; width: 36px; height: 36px; display: flex; justify-content: center; align-items: center; box-shadow: 0 3px 6px rgba(0,0,0,0.2);">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="white" width="20" height="20">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>
        </div>
        <div style="margin-top: 5px; font-size: 12px; padding: 2px 6px; background-color: rgba(0,0,0,0.6); border-radius: 4px; color: white; white-space: nowrap;" class="font-semibold">${name}</div>
      </div>
    `,
            iconSize: [36, 60],
            iconAnchor: [18, 45],
        });
    };

    const createCustomPointMarker = (name: string) => {
        return L.divIcon({
            className: 'custom-marker',
            html: `
      <div style="text-align: center; display: flex; flex-direction: column; align-items: center;">
        <div style="background-color: oklch(0.623 0.214 259.815); border-radius: 50%; width: 36px; height: 36px; display: flex; justify-content: center; align-items: center; box-shadow: 0 3px 6px rgba(0,0,0,0.2);">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="white" width="20" height="20">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
          </svg>
        </div>
        <div style="margin-top: 5px; font-size: 12px; padding: 2px 6px; background-color: rgba(0,0,0,0.6); border-radius: 4px; color: white; white-space: nowrap;" class="font-semibold">${name}</div>
      </div>
    `,
            iconSize: [36, 60],
            iconAnchor: [18, 45],
        });
    };

    const MapHandler = () => {
        useMapEvents({
            click(e) {
                handleMapClick(e);
            },
        });
        return null;
    }

    // Function to handle map clicks
    const handleMapClick = async (e: L.LeafletMouseEvent) => {
        setIsAdding(true);
        try {
            const pointName = prompt('Entrez le nom du point d\'intérêt :');
            if (!pointName) return;

            const { lat, lng } = e.latlng;
            await onPointAdd(pointName, lat, lng);
        } finally {
            setIsAdding(false);
        }
    };

    // Find center position based on userPositions, or default if none
    const getCenterPosition = () => {
        if (userPositions.length > 0) {
            return [
                userPositions.reduce((sum, pos) => sum + pos.latitude, 0) / userPositions.length,
                userPositions.reduce((sum, pos) => sum + pos.longitude, 0) / userPositions.length
            ] as [number, number];
        }
        return [46.9, 6.71] as [number, number];
    };

    // Function to calculate distance to another user from current user position
    const calculateDistanceToUser = (otherUserPosition: UserPosition) => {
        const userPosition = getCurrentUserPosition();
        if (!userPosition || userPosition.userId === otherUserPosition.userId) return null;
        
        return worldCalculationService.calculateDistance(
            { latitude: userPosition.latitude, longitude: userPosition.longitude },
            { latitude: otherUserPosition.latitude, longitude: otherUserPosition.longitude }
        );
    };

    // Function to calculate distance to a point from current user position
    const calculateDistanceToPoint = (point: PointOfInterest) => {
        const userPosition = getCurrentUserPosition();
        if (!userPosition) return null;
        
        return worldCalculationService.calculateDistance(
            { latitude: userPosition.latitude, longitude: userPosition.longitude },
            { latitude: point.location.coordinates[1], longitude: point.location.coordinates[0] }
        );
    };

    // Handle point marker click
    const handlePointClick = (point: PointOfInterest) => {
        setSelectedPoint(point);
    };

    // Handle removing a point
    const handleRemovePoint = async (pointId: string) => {
        if (onPointRemove) {
            await onPointRemove(pointId);
            setSelectedPoint(null);
        }
    };

    return (
        <div className="relative">
            <div className="rounded-lg overflow-hidden shadow-lg border border-gray-200">
                <MapContainer 
                    center={getCenterPosition()} 
                    zoom={10}
                    style={{ height: '350px', width: '100%' }}
                    className="z-0"
                >
                    <TileLayer
                        url="https://api.maptiler.com/maps/satellite/{z}/{x}/{y}@2x.jpg?key=32M5AZlrVO120Ncyc1J5"
                        attribution='<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a>'
                        maxNativeZoom={18}
                        maxZoom={22}
                    />
                    {userPositions.map((position, index) => {
                        const memberName = memberObjects.find(member => member.id === position.userId)?.name || '';
                        return (
                            <Marker
                                key={index}
                                position={[position.latitude, position.longitude]}
                                icon={createCustomPersonMarker(memberName)}
                                eventHandlers={{
                                    click: () => {} // Just to make it clickable
                                }}
                            >
                                <Tooltip permanent={false} direction="top" offset={[0, -35]}>
                                    {memberName}
                                </Tooltip>
                                <Popup>
                                    <div className="p-0.5">
                                        <h3 className="font-semibold text-base">{memberName}</h3>
                                        <p className="text-sm mt-0.5">Dernière mise à jour: {new Date(position.timestamp).toLocaleTimeString()}</p>
                                        {calculateDistanceToUser(position) !== null && (
                                            <p className="text-sm font-medium mt-0.5">Distance: {Math.round(calculateDistanceToUser(position) || 0)}m</p>
                                        )}
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    })}
                    {points.map((point, index) => (
                        <Marker
                            key={index+userPositions.length}
                            position={[point.location.coordinates[1], point.location.coordinates[0]]}
                            icon={createCustomPointMarker(point.name)}
                            eventHandlers={{
                                click: () => handlePointClick(point)
                            }}
                        >
                            {selectedPoint && selectedPoint._id === point._id && (
                                <Popup>
                                    <div className="p-0.5">
                                        <h3 className="font-semibold text-base">{point.name}</h3>
                                        {calculateDistanceToPoint(point) !== null && (
                                            <p className="text-sm font-medium mt-0.5">Distance: {Math.round(calculateDistanceToPoint(point) || 0)}m</p>
                                        )}
                                        {onPointRemove && (
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRemovePoint(point._id);
                                                }}
                                                className="mt-1 px-3 py-1.5 bg-red-500 text-white text-sm rounded hover:bg-red-600 w-full font-medium"
                                            >
                                                Supprimer
                                            </button>
                                        )}
                                    </div>
                                </Popup>
                            )}
                        </Marker>
                    ))}
                    <MapHandler />
                </MapContainer>
            </div>
            
            {/* Legend */}
            <div className="absolute bottom-3 left-3 bg-white p-2 rounded-md shadow-md z-10 text-xs">
                <div className="flex items-center mb-1">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                    <span>Membres</span>
                </div>
                <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                    <span>Points d'intérêt</span>
                </div>
            </div>
            
            {/* Map instructions */}
            <div className="absolute top-3 right-3 bg-white p-2 rounded-md shadow-md z-10 text-xs text-gray-700">
                Cliquez sur la carte pour ajouter un point d'intérêt
            </div>
            
            {/* Loading indicator */}
            {isAdding && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 z-20">
                    <div className="bg-white p-3 rounded-lg shadow-lg">
                        <svg className="animate-spin h-5 w-5 text-blue-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="mt-1 text-sm">Ajout en cours...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GroupMap; 