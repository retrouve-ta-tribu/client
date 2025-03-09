import socketService, { RoomEvents } from './socketService';
import geolocationService, {UserPosition} from './geolocationService';

export enum LocationEvents {
  LocationUpdate = 'LocationUpdate'
}

interface IncomingPositionBroadcastData {
  type: LocationEvents;
  position: UserPosition;
}

/**
 * A real time location sharing service using socketService to transmit geolocationService data
 */
class LocationSharingService {
  private groupId: string | null = null;
  private userId: string | null = null;
  private intervalId: number | null = null;
  private positions: Map<string, UserPosition> = new Map();
  private locationUpdateListeners: Set<(positions: UserPosition[]) => void> = new Set();
  
  /**
   * Check if socket is connected
   * @returns True if socket is connected, false otherwise
   */
  isSocketConnected(): boolean {
    return socketService.isConnected();
  }
  
  /**
   * Connect to socket server
   * @returns Promise that resolves when connected
   */
  async connectSocket(): Promise<void> {
    return socketService.connect();
  }
  
  /**
   * Start sharing location in a group
   * @param groupId The ID of the group to share location in
   * @param userId The ID of the user sharing their location
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
    
    // Set up listener for location updates from other users
    socketService.addListener<IncomingPositionBroadcastData>(RoomEvents.Broadcast, this.handleLocationUpdate);
    
    // Start tracking location and broadcasting updates
    await geolocationService.startTracking(userId, (position) => {
      this.broadcastLocation(position);
    });
    
    // Set up interval to broadcast location periodically (every second)
    this.intervalId = window.setInterval(() => {
      const position = geolocationService.getLastPosition();
      if (position) {
        this.broadcastLocation(position);
      }
    }, 1000);
  }
  
  /**
   * Stop sharing location
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
   * Handle location update from another user
   * @param data The location message
   */
  private handleLocationUpdate = (data: IncomingPositionBroadcastData): void => {
    // Check if this is a location update message
    if (data && data.type === LocationEvents.LocationUpdate) {
      const position = data.position;
      this.positions.set(position.userId, position);

      // Clean up old positions (older than 60 seconds)
      const now = Date.now();
      for (const [userId, pos] of this.positions.entries()) {
        if (now - pos.timestamp > 60000) {
          this.positions.delete(userId);
        }
      }

      // Notify listeners
      this.notifyListeners();
    }
  };
  
  /**
   * Broadcast location to the group
   * @param position The position to broadcast
   */
  private broadcastLocation(position: UserPosition): void {
    if (!this.groupId || !this.userId) {
      return;
    }

    const message = {
      type: LocationEvents.LocationUpdate,
      position,
    };
    
    socketService.broadcast(this.groupId, message);
  }
  
  /**
   * Add a listener for location updates
   * @param callback The callback to call when locations are updated
   */
  addLocationUpdateListener(callback: (positions: UserPosition[]) => void): void {
    this.locationUpdateListeners.add(callback);
  }
  
  /**
   * Remove a listener for location updates
   * @param callback The callback to remove
   */
  removeLocationUpdateListener(callback: (positions: UserPosition[]) => void): void {
    this.locationUpdateListeners.delete(callback);
  }
  
  /**
   * Notify all listeners of location updates
   */
  private notifyListeners(): void {
    const positions = Array.from(this.positions.values());
    this.locationUpdateListeners.forEach(callback => {
      callback(positions);
    });
  }
  
  /**
   * Get all current positions
   * @returns Array of all current positions
   */
  getAllPositions(): UserPosition[] {
    return Array.from(this.positions.values());
  }
}

// Create a singleton instance
const locationSharingService = new LocationSharingService();
export default locationSharingService; 