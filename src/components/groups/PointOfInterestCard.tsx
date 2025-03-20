import React, { FC } from 'react';
import {PointOfInterest, Position} from '../../services/types';
import XIcon from '../icons/XIcon';
import DirectionVisualizer from "../sprunk/DirectionVisualizer.tsx";

interface PointOfInterestCardProps {
    point: PointOfInterest;
    myPosition: Position;
    onRemove: (pointId: string) => void;
}

const PointOfInterestCard: FC<PointOfInterestCardProps> = ({ point, myPosition, onRemove }) => {
    return (
        <div 
            className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center"
        >
            <div>
                <h3 className="font-medium text-gray-900">{point.name}</h3>
                <p className="text-xs text-gray-500">
                    {point.location.coordinates[1]}, {point.location.coordinates[0]}
                </p>
            </div>
            <div>
                { point.location.coordinates && myPosition && (
                    <DirectionVisualizer position={{longitude : point.location.coordinates[0], latitude : point.location.coordinates[1] }} startPosition={myPosition} />
                )}
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