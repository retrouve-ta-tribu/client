import { PointOfInterest } from './types';

/**
 * Service for managing points of interest
 */
class PointsOfInterestService {
    private static instance: PointsOfInterestService;
    private baseUrl: string;

    private constructor() {
        const apiUrl = import.meta.env.VITE_API_URL;
        if (!apiUrl) {
            throw new Error('VITE_API_URL environment variable is not defined');
        }
        this.baseUrl = `${apiUrl}/api`;
    }

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
        return response.json();
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
    }
}

export default PointsOfInterestService.getInstance(); 