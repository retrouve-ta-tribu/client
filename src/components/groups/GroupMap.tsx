import { FC } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from "leaflet";
import { Member, PointOfInterest, UserPosition } from "../../services/types";

interface GroupMapProps {
    userPositions: UserPosition[];
    points: PointOfInterest[];
    memberObjects: Member[];
    groupId: string;
    onPointAdd: (name: string, lat: number, lng: number) => Promise<void>;
}

const GroupMap: FC<GroupMapProps> = ({ 
    userPositions, 
    points, 
    memberObjects,
    onPointAdd
}) => {
    const createCustomPersonMarker = (name: string) => {
        return L.divIcon({
            className: 'custom-marker',
            html: `
      <div style="text-align: center; display: flex; flex-direction: column; align-items: center;">
        <img src="/marker-icon.png" alt="Marker" style="width: 25px; height: 41px;"/>
        <div style="margin-top: 5px; font-size: 12px; color: white; white-space: nowrap;" class="font-semibold">${name}</div>
      </div>
    `,
            iconSize: [25, 41],
            iconAnchor: [12, 41],
        });
    };

    const createCustomPointMarker = (name: string) => {
        return L.divIcon({
            className: 'custom-marker',
            html: `
      <div style="text-align: center; display: flex; flex-direction: column; align-items: center;">
        <img src="/marker-icon-point.png" alt="Marker" style="width: 25px; height: 41px;"/>
        <div style="margin-top: 5px; font-size: 12px; color: white; white-space: nowrap;" class="font-semibold">${name}</div>
      </div>
    `,
            iconSize: [25, 41],
            iconAnchor: [12, 41],
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
        const pointName = prompt('Entrez le nom du point d\'intérêt :');
        if (!pointName) return;

        const { lat, lng } = e.latlng;
        await onPointAdd(pointName, lat, lng);
    };

    return (
        <MapContainer center={[46.9, 6.71]} zoom={10}
                      zoomControl={false} style={{ height: '400px', width: '100%' }}>
            <TileLayer
                url="https://api.maptiler.com/maps/satellite/{z}/{x}/{y}@2x.jpg?key=32M5AZlrVO120Ncyc1J5"
                attribution='<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>'
                maxNativeZoom={18}
                maxZoom={22}
            />
            {userPositions.map((position, index) => (
                <Marker
                    key={index}
                    position={[position.latitude, position.longitude]}
                    icon={createCustomPersonMarker(memberObjects.find(member => member.id === position.userId)?.name || '')}
                >
                </Marker>
            ))}
            {points.map((position, index) => (
                <Marker
                    key={index+userPositions.length}
                    position={[position.location.coordinates[1], position.location.coordinates[0]]}
                    icon={createCustomPointMarker(position.name)}
                >
                </Marker>
            ))}
            <MapHandler />
        </MapContainer>
    );
};

export default GroupMap; 