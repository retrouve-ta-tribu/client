import { Event } from "sprunk-engine";

/**
 * Service for handling geolocation functionality
 */
class GeolocationService {
  private watchId: number | null = null;
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
        alert("La géolocalisation n'est pas prise en charge par ce navigateur. Certaines fonctionnalités peuvent ne pas fonctionner correctement.");
        return;
      }
      if(this.watchId) return;
      
      // Clear any existing watch
      this.stopTracking();
      
      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
          this.onPositionUpdated.emit(position);
          resolve();
        },
        (error) => {
          console.error('Error getting location:', error);
          alert("Erreur lors de la récupération de la position : " + error);
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
}

// Create a singleton instance
const geolocationService = new GeolocationService();
export default geolocationService; 