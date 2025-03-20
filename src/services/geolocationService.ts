import { Event } from "sprunk-engine";

/**
 * Service for handling geolocation functionality
 */
class GeolocationService {
  private watchId: number | null = null;
  private lastPosition: GeolocationPosition | null = null;
  public onPositionUpdated: Event<GeolocationPosition> = new Event();
  
  /**
   * Start tracking the user's location
   * @param onPositionUpdate Callback function to call when position is updated
   * @returns Promise that resolves when tracking starts
   */
  startTracking(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }
      if(this.watchId) return;
      
      // Clear any existing watch
      this.stopTracking();
      
      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
          this.lastPosition = position;
          this.onPositionUpdated.emit(position);
          resolve();
        },
        (error) => {
          console.error('Error getting location:', error);
          this.watchId = null;
          reject(error);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 10000
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
  getLastPosition(): GeolocationPosition | null {
    return this.lastPosition;
  }
  
  /**
   * Get the current position once
   * @returns Promise that resolves with the current position
   */
  getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.lastPosition = position;
          resolve(position);
        },
        (error) => {
          console.error('Error getting location:', error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 10000
        }
      );
    });
  }
}

// Create a singleton instance
const geolocationService = new GeolocationService();
export default geolocationService; 