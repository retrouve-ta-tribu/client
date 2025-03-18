import React from 'react';
import { Point } from '../../services/types';

interface PointCardProps {
  point: Point;
  groupId: string;
  onDelete: (pointId: string) => void;
}

const PointCard: React.FC<PointCardProps> = ({ point, onDelete }) => {
  const formatCoordinate = (coord: number): string => {
    return coord.toFixed(6);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-2 flex justify-between items-center">
      <div>
        <h3 className="font-medium text-gray-900">{point.name}</h3>
        <p className="text-sm text-gray-500">
          {formatCoordinate(point.latitude)}, {formatCoordinate(point.longitude)}
        </p>
      </div>
      <button
        onClick={() => onDelete(point.id)}
        className="text-red-500 hover:text-red-700"
        aria-label="Delete point"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
};

export default PointCard; 