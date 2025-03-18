import { PointOfInterest } from './types';
import socketService, { RoomEvents } from './socketService';

export enum PointEvents {
    PointsChanged = 'PointsChanged'
}

interface PointsBroadcastData {
    type: PointEvents;
    groupId: string;
}

/**
 * Service for managing points of interest
 */
class PointsOfInterestService {
    private static instance: PointsOfInterestService;
    private baseUrl: string;
    private pointsListeners: Map<string, Set<() => void>> = new Map(); // groupId -> Set of listeners

    private constructor() {
        const apiUrl = import.meta.env.VITE_API_URL;
        if (!apiUrl) {
            throw new Error('VITE_API_URL environment variable is not defined');
        }
        this.baseUrl = `${apiUrl}/api`;

        // Set up listener for points updates
        socketService.addListener<PointsBroadcastData>(RoomEvents.Broadcast, this.handlePointsUpdate);
    }

    private handlePointsUpdate = (data: PointsBroadcastData): void => {
        if (data.type === PointEvents.PointsChanged) {
            this.notifyListeners(data.groupId);
        }
    };

    /*
     * Get all points of interest for a group
     * @param groupId - The ID of the group
     * @returns A promise that resolves to an array of PointOfInterest objects
     */
    public static getInstance(): PointsOfInterestService {
        if (!PointsOfInterestService.instance) {
            PointsOfInterestService.instance = new PointsOfInterestService();
        }
        return PointsOfInterestService.instance;
    }

    /*
     * Get all points of interest for a group
     * @param groupId - The ID of the group
     * @returns A promise that resolves to an array of PointOfInterest objects
     */
    async getGroupPoints(groupId: string): Promise<PointOfInterest[]> {
        const response = await fetch(`${this.baseUrl}/groups/${groupId}/points`);
        if (!response.ok) throw new Error('Failed to fetch points of interest');
        return response.json();
    }

    /*
     * Add a point of interest to a group
     * @param groupId - The ID of the group
     * @param name - The name of the point of interest
     * @param latitude - The latitude of the point of interest
     * @param longitude - The longitude of the point of interest
     */
    async addPoint(groupId: string, name: string, latitude: number, longitude: number): Promise<PointOfInterest> {
        const response = await fetch(`${this.baseUrl}/groups/${groupId}/points`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name,
                location: {
                    type: 'Point',
                    coordinates: [longitude, latitude]
                }
            })
        });
        if (!response.ok) throw new Error('Failed to add point of interest');
        const result = await response.json();
        
        // Broadcast the change
        this.broadcastPointsChanged(groupId);
        
        return result;
    }

    /*
     * Remove a point of interest from a group
     * @param groupId - The ID of the group
     * @param pointId - The ID of the point of interest
     */
    async removePoint(groupId: string, pointId: string): Promise<void> {
        const response = await fetch(`${this.baseUrl}/groups/${groupId}/points/${pointId}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to remove point of interest');
        
        // Broadcast the change
        this.broadcastPointsChanged(groupId);
    }

    /*
     * Add a listener for points of interest
     * @param groupId - The ID of the group
     * @param callback - The callback to add
     */
    addPointsListener(groupId: string, callback: () => void): void {
        if (!this.pointsListeners.has(groupId)) {
            this.pointsListeners.set(groupId, new Set());
        }
        this.pointsListeners.get(groupId)?.add(callback);
    }

    /*
     * Remove a listener for points of interest
     * @param groupId - The ID of the group
     * @param callback - The callback to remove
     */
    removePointsListener(groupId: string, callback: () => void): void {
        this.pointsListeners.get(groupId)?.delete(callback);
        if (this.pointsListeners.get(groupId)?.size === 0) {
            this.pointsListeners.delete(groupId);
        }
    }

    /*
     * Notify listeners of a group
     * @param groupId - The ID of the group
     */
    private notifyListeners(groupId: string): void {
        this.pointsListeners.get(groupId)?.forEach(callback => {
            callback();
        });
    }

    /*
     * Broadcast the points changed event to all listeners
     * @param groupId - The ID of the group
     */
    private broadcastPointsChanged(groupId: string): void {
        const broadcastData: PointsBroadcastData = {
            type: PointEvents.PointsChanged,
            groupId
        };
        socketService.broadcast(groupId, broadcastData);
    }
}

export default PointsOfInterestService.getInstance(); 