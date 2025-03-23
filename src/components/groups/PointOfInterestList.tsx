import { FC } from 'react';
import {PointOfInterest, Position} from '../../services/types';
import PointOfInterestCard from './PointOfInterestCard';

interface PointOfInterestListProps {
    points: PointOfInterest[];
    myPosition: Position;
    onRemovePoint: (pointId: string) => void;
}

const PointOfInterestList: FC<PointOfInterestListProps> = ({ points, myPosition, onRemovePoint }) => {
    return (
        <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-2">
            {points.map((point) => (
                <PointOfInterestCard 
                    key={point._id}
                    point={point}
                    myPosition={myPosition}
                    onRemove={onRemovePoint}
                />
            ))}
            {points.length === 0 && (
                <p className="text-center text-gray-500 py-4">Aucun point</p>
            )}
        </div>
    );
};

export default PointOfInterestList; 