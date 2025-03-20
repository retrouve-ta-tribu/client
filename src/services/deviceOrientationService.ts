import { DeviceOrientationData } from "./types.ts";

/**
 * Service for handling device orientation functionality
 */
class DeviceOrientationService {
    private lastOrientation: DeviceOrientationData | null = null;
    private orientationListener: ((event: DeviceOrientationEvent) => void) | null = null;

    /**
     * Start tracking the device's orientation
     * @param onOrientationUpdate Callback function to call when orientation is updated
     * @returns Promise that resolves when tracking starts
     */
    startTracking(onOrientationUpdate: (orientation: DeviceOrientationData) => void): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!window.DeviceOrientationEvent) {
                reject(new Error('Device orientation is not supported by this browser'));
                return;
            }

            // Request permission if required (e.g., on iOS)
            if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
                (DeviceOrientationEvent as any).requestPermission()
                    .then((permission: string) => {
                        if (permission === 'granted') {
                            this.setupOrientationListener(onOrientationUpdate);
                            resolve();
                        } else {
                            reject(new Error('Permission to access device orientation was denied'));
                        }
                    })
                    .catch((error: Error) => {
                        reject(error);
                    });
            } else {
                this.setupOrientationListener(onOrientationUpdate);
                resolve();
            }
        });
    }

    /**
     * Set up the orientation event listener
     * @param onOrientationUpdate Callback function to call when orientation is updated
     */
    private setupOrientationListener(onOrientationUpdate: (orientation: DeviceOrientationData) => void): void {
        this.orientationListener = (event: DeviceOrientationEvent) => {
            const newOrientation: DeviceOrientationData = {
                alpha: event.alpha, // Z-axis rotation (0-360)
                beta: event.beta,   // X-axis rotation (-180 to 180)
                gamma: event.gamma, // Y-axis rotation (-90 to 90)
                timestamp: Date.now(),
            };

            this.lastOrientation = newOrientation;
            onOrientationUpdate(newOrientation);
        };

        window.addEventListener('deviceorientationabsolute', this.orientationListener);
    }

    /**
     * Stop tracking the device's orientation
     */
    stopTracking(): void {
        if (this.orientationListener) {
            window.removeEventListener('deviceorientationabsolute', this.orientationListener);
            this.orientationListener = null;
        }
    }

    /**
     * Get the last known orientation
     * @returns The last known orientation or null if not available
     */
    getLastOrientation(): DeviceOrientationData | null {
        return this.lastOrientation;
    }
}

// Create a singleton instance
const deviceOrientationService = new DeviceOrientationService();
export default deviceOrientationService;