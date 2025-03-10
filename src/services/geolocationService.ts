import {UserPosition} from "./types.ts";

/**
 * Service for handling geolocation functionality
 */
class GeolocationService {
  private watchId: number | null = null;
  private lastPosition: UserPosition | null = null;
  
  /**
   * Start tracking the user's location
   * @param userId The ID of the user to track
   * @param onPositionUpdate Callback function to call when position is updated
   * @returns Promise that resolves when tracking starts
   */
  startTracking(userId: string, onPositionUpdate: (position: UserPosition) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }
      
      // Clear any existing watch
      this.stopTracking();
      
      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newPosition: UserPosition = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            userId,
            timestamp: Date.now()
          };
          
          this.lastPosition = newPosition;
          onPositionUpdate(newPosition);
          resolve();
        },
        (error) => {
          console.error('Error getting location:', error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 5000
        }
      );
    });
  }
  
  /**
   * Stop tracking the user's location
   */
  stopTracking(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }
  
  /**
   * Get the last known position
   * @returns The last known position or null if not available
   */
  getLastPosition(): UserPosition | null {
    return this.lastPosition;
  }
  
  /**
   * Get the current position once
   * @param userId The ID of the user
   * @returns Promise that resolves with the current position
   */
  getCurrentPosition(userId: string): Promise<UserPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newPosition: UserPosition = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            userId,
            timestamp: Date.now()
          };
          
          this.lastPosition = newPosition;
          resolve(newPosition);
        },
        (error) => {
          console.error('Error getting location:', error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 5000
        }
      );
    });
  }
}

// Create a singleton instance
const geolocationService = new GeolocationService();
export default geolocationService; 