import { Position, UserPosition } from '../services/types';

/**
 * Converts a UserPosition to a Position by extracting latitude and longitude only
 */
export const userPositionToPosition = (userPosition: UserPosition | undefined): Position => {
    if (!userPosition) {
        return { latitude: 0, longitude: 0 };
    }
    
    return {
        latitude: userPosition.latitude,
        longitude: userPosition.longitude
    };
};

/**
 * Safely gets the current user's position from a list of user positions
 */
export const getCurrentUserPosition = (
    userPositions: UserPosition[], 
    userId: string | undefined
): Position => {
    if (!userId) {
        return { latitude: 0, longitude: 0 };
    }
    
    const userPosition = userPositions.find(pos => pos.userId === userId);
    return userPositionToPosition(userPosition);
}; 