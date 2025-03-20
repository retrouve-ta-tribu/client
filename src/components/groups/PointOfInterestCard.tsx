import { FC } from 'react';
import { PointOfInterest } from '../../services/types';
import XIcon from '../icons/XIcon';

interface PointOfInterestCardProps {
    point: PointOfInterest;
    onRemove: (pointId: string) => void;
}

const PointOfInterestCard: FC<PointOfInterestCardProps> = ({ point, onRemove }) => {
    return (
        <div 
            className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center"
        >
            <div>
                <h3 className="font-medium text-gray-900">{point.name}</h3>
                <p className="text-sm text-gray-500">
                    {point.location.coordinates[0]}, {point.location.coordinates[1]}
                </p>
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