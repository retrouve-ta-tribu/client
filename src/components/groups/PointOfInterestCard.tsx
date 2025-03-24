import { FC } from 'react';
import {PointOfInterest, Position} from '../../services/types';
import XIcon from '../icons/XIcon';
import DirectionVisualizer from "../sprunk/DirectionVisualizer.tsx";
import MemberLocation from "./MemberLocation.tsx";

interface PointOfInterestCardProps {
    point: PointOfInterest;
    myPosition: Position;
    onRemove: (pointId: string) => void;
}

const PointOfInterestCard: FC<PointOfInterestCardProps> = ({ point, myPosition, onRemove }) => {
    // Extract coordinates for reuse
    const poiPosition: Position = {
        longitude: point.location.coordinates[0], 
        latitude: point.location.coordinates[1]
    };
    
    return (
        <div 
            className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center"
        >
            <div className='flex flex-row gap-4'>
                <div className='bg-gray-200 rounded-2xl'>
                    { point.location.coordinates && myPosition && (
                        <DirectionVisualizer position={poiPosition} startPosition={myPosition} arrowTexture='/arrow-blue.png'/>
                    )}
                </div>
                <div>
                    <h3 className="font-medium text-gray-900">{point.name}</h3>
                    <MemberLocation position={poiPosition} startPosition={myPosition} locationType="poi"/>
                </div>
            </div>
            <button
                onClick={() => onRemove(point._id)}
                className="p-1 hover:bg-gray-100 rounded-full text-red-500 hover:text-red-600 cursor-pointer"
                aria-label="Remove point"
            >
                <XIcon className="w-5 h-5 text-gray-500" />
            </button>
        </div>
    );
};

export default PointOfInterestCard; 