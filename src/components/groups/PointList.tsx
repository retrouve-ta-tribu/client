import React, { useEffect, useState } from 'react';
import { Point } from '../../services/types';
import PointCard from './PointCard';
import pointService from '../../services/pointService';

interface PointListProps {
  groupId: string;
}

const PointList: React.FC<PointListProps> = ({ groupId }) => {
  const [points, setPoints] = useState<Point[]>([]);

  const fetchPoints = async () => {
    try {
      const points = await pointService.getGroupPointsOfInterest(groupId);
      setPoints(points);
    } catch (error) {
      console.error('Failed to fetch points:', error);
    }
  };

  const handleDeletePoint = async (pointId: string) => {
    try {
      // First remove the point from the group
      await pointService.removePointOfInterestFromGroup(groupId, pointId);
      // Then delete the point itself
      await pointService.deletePoint(pointId);
      // Update the points list
      setPoints(points.filter(point => point.id !== pointId));
    } catch (error) {
      console.error('Failed to delete point:', error);
    }
  };

  useEffect(() => {
    fetchPoints();
  }, [groupId]);

  // Add event listener for refresh events
  useEffect(() => {
    const element = document.querySelector('[data-testid="point-list"]');
    if (element) {
      const handleRefresh = () => {
        fetchPoints();
      };
      element.addEventListener('refresh', handleRefresh);
      return () => {
        element.removeEventListener('refresh', handleRefresh);
      };
    }
  }, []);

  return (
    <div className="mt-4" data-testid="point-list">
      <h2 className="text-lg font-semibold mb-2">Points of Interest</h2>
      <div className="max-h-60 overflow-y-auto">
        {points.map((point) => (
          <PointCard
            key={point.id}
            point={point}
            groupId={groupId}
            onDelete={handleDeletePoint}
          />
        ))}
        {points.length === 0 && (
          <p className="text-gray-500 text-sm">No points of interest yet</p>
        )}
      </div>
    </div>
  );
};

export default PointList; 