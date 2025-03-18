import { FC } from 'react';
import { PointOfInterest } from '../../services/types';
import XIcon from '../icons/XIcon';

interface PointOfInterestListProps {
    points: PointOfInterest[];
    onRemovePoint: (pointId: string) => void;
}

const PointOfInterestList: FC<PointOfInterestListProps> = ({ points, onRemovePoint }) => {
    return (
        <div className="space-y-2 max-h-48 overflow-y-auto">
            {points.map((point) => (
                <div 
                    key={point._id}
                    className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center"
                >
                    <div>
                        <h3 className="font-medium text-gray-900">{point.name}</h3>
                        <p className="text-sm text-gray-500">
                    // coords
                        </p>
                    </div>
                    <button
                        onClick={() => onRemovePoint(point._id)}
                        className="p-1 hover:bg-gray-100 rounded-full text-red-500 hover:text-red-600 cursor-pointer"
                        aria-label="Remove point"
                    >
                        <XIcon className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
            ))}
            {points.length === 0 && (
                <p className="text-center text-gray-500 py-4">Aucun point d'intérêt</p>
            )}
        </div>
    );
};

export default PointOfInterestList; 