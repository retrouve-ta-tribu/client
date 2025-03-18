import socketService, { RoomEvents } from './socketService';
import geolocationService from './geolocationService';
import { UserPosition } from "./types.ts";

export enum LocationEvents {
    LocationUpdate = 'LocationUpdate'
}

interface IncomingPositionBroadcastData {
    type: LocationEvents;
    position: UserPosition;
}

class LocationSharingService {
    private static instance: LocationSharingService;
    private groupId: string | null = null;
    private userId: string | null = null;
    private intervalId: number | null = null;
    private positions: Map<string, UserPosition> = new Map();
    private locationUpdateListeners: Set<(positions: UserPosition[]) => void> = new Set();

    private constructor() {}

    /**
     * Get the singleton instance of the LocationSharingService
     * @returns The singleton instance of the LocationSharingService
     */
    public static getInstance(): LocationSharingService {
        if (!LocationSharingService.instance) {
            LocationSharingService.instance = new LocationSharingService();
        }
        return LocationSharingService.instance;
    }

    /**
     * Check if the socket is connected
     * @returns True if the socket is connected, false otherwise
     */
    isSocketConnected(): boolean {
        return socketService.isConnected();
    }

    /**
     * Connect to the socket
     * @returns A promise that resolves when the socket is connected
     */
    async connectSocket(): Promise<void> {
        return socketService.connect();
    }

    /**
     * Start sharing location updates
     * @param groupId - The ID of the group to share location updates with
     * @param userId - The ID of the user to share location updates from
     * @returns A promise that resolves when the location sharing starts
     */
    async startSharing(groupId: string, userId: string): Promise<void> {
        // Stop any existing sharing
        this.stopSharing();
        
        this.groupId = groupId;
        this.userId = userId;
        
        // Connect to socket if not already connected
        if (!socketService.isConnected()) {
            await socketService.connect();
        }
        
        // Join the room for this group
        socketService.joinRoom(groupId);
        
        // Set up listener for location updates
        socketService.addListener<IncomingPositionBroadcastData>(RoomEvents.Broadcast, this.handleLocationUpdate);
        
        // Start tracking location and broadcasting updates
        await geolocationService.startTracking(userId, (position) => {
            this.broadcastLocation(position);
        });
        
        // Set up interval to broadcast location periodically
        this.intervalId = window.setInterval(() => {
            const position = geolocationService.getLastPosition();
            if (position) {
                this.broadcastLocation(position);
            }
        }, 1000);
    }

    /**
     * Stop sharing location updates
     */
    stopSharing(): void {
        if (this.intervalId !== null) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        
        geolocationService.stopTracking();
        
        if (this.groupId) {
            socketService.removeListener(RoomEvents.Broadcast, this.handleLocationUpdate);
            socketService.leaveRoom(this.groupId);
            this.groupId = null;
        }
        
        this.userId = null;
        this.positions.clear();
        this.notifyListeners();
    }

    /**
     * Handle incoming location updates
     * @param data - The incoming location update data
     */
    private handleLocationUpdate = (data: IncomingPositionBroadcastData): void => {
        if (data.type === LocationEvents.LocationUpdate) {
            const position = data.position;
            this.positions.set(position.userId, position);

            // Clean up old positions (older than 60 seconds)
            const now = Date.now();
            for (const [userId, pos] of this.positions.entries()) {
                if (now - pos.timestamp > 60000) {
                    this.positions.delete(userId);
                }
            }

            this.notifyListeners();
        }
    };

    /**
     * Broadcast a location update
     * @param position - The position to broadcast
     */
    private broadcastLocation(position: UserPosition): void {
        if (!this.groupId || !this.userId) return;

        const message = {
            type: LocationEvents.LocationUpdate,
            position,
        };
        
        socketService.broadcast(this.groupId, message);
    }

    /**
     * Add a location update listener
     * @param callback - The callback to add
     */
    addLocationUpdateListener(callback: (positions: UserPosition[]) => void): void {
        this.locationUpdateListeners.add(callback);
    }

    /**
     * Remove a location update listener
     * @param callback - The callback to remove
     */
    removeLocationUpdateListener(callback: (positions: UserPosition[]) => void): void {
        this.locationUpdateListeners.delete(callback);
    }

    /**
     * Notify listeners of location updates
     */
    private notifyListeners(): void {
        const positions = Array.from(this.positions.values());
        this.locationUpdateListeners.forEach(callback => {
            callback(positions);
        });
    }

    /**
     * Get all positions
     * @returns All positions
     */
    getAllPositions(): UserPosition[] {
        return Array.from(this.positions.values());
    }
}

export default LocationSharingService.getInstance(); 