import {DeviceOrientationData, Position} from "./types.ts";

/**
 * Service for calculating the arrow direction based on user position, target position, and device orientation
 */
class WorldCalculationService {
    /**
     * Calculate the bearing angle between two positions
     * @param start The starting position (latitude, longitude)
     * @param end The target position (latitude, longitude)
     * @returns The bearing angle in degrees (0-360)
     */
    calculateBearing(start: Position, end: Position): number {
        const startLat = this.toRadians(start.latitude);
        const startLong = this.toRadians(start.longitude);
        const endLat = this.toRadians(end.latitude);
        const endLong = this.toRadians(end.longitude);

        const dLong = endLong - startLong;

        const x = Math.sin(dLong) * Math.cos(endLat);
        const y = Math.cos(startLat) * Math.sin(endLat) - Math.sin(startLat) * Math.cos(endLat) * Math.cos(dLong);

        const bearing = Math.atan2(x, y);

        return ((bearing * 180 / Math.PI) + 360) % 360; // Normalize to 0-360
    }

    /**
     * Calculate the arrow direction based on device orientation and target bearing
     * @param targetBearing The bearing angle to the target (0-360)
     * @param deviceOrientation The current device orientation (alpha, beta, gamma)
     * @returns The arrow direction in degrees (0-360)
     */
    calculateArrowDirection(targetBearing: number, deviceOrientation: DeviceOrientationData): number {
        const { alpha } = deviceOrientation;

        if (alpha === null) {
            const arrowDirection = (targetBearing + 360) % 360;
            return arrowDirection;
        }

        // Adjust the target bearing based on the device's compass direction (alpha)
        const arrowDirection = (targetBearing - alpha + 360) % 360;

        return arrowDirection;
    }

    /**
     * Convert degrees to radians
     * @param degrees The angle in degrees
     * @returns The angle in radians
     */
    private toRadians(degrees: number): number {
        return degrees * (Math.PI / 180);
    }
}

// Create a singleton instance
const worldCalculationService = new WorldCalculationService();
export default worldCalculationService;