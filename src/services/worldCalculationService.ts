import {Quaternion, Vector3} from "sprunk-engine";
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
     * @returns A quaternion representing the arrow direction
     */
    calculateArrowDirection(targetBearing: number, deviceOrientation: DeviceOrientationData): Quaternion {
        const { alpha, beta, gamma } = deviceOrientation;

        if (alpha === null || beta === null || gamma === null) {
            // If orientation data is missing, return a quaternion based on the target bearing only
            return Quaternion.fromEulerAngles(0, this.toRadians(targetBearing), 0);
        }

        // Convert device orientation angles to radians
        const alphaRad = this.toRadians(alpha);
        const betaRad = this.toRadians(beta);
        const gammaRad = this.toRadians(gamma);

        // Create a quaternion from the device's orientation
        const deviceOrientationQuaternion = Quaternion.identity();
        deviceOrientationQuaternion.rotateAroundAxis(new Vector3(0, 1, 0), -alphaRad);
        //deviceOrientationQuaternion.rotateAroundAxis(new Vector3(0, 0, 1), (Math.PI/2) -betaRad);
        //deviceOrientationQuaternion.rotateAroundAxis(new Vector3(1, 0, 0), -gammaRad);


        // Create a quaternion representing the target bearing (rotation around the Y-axis)
        //const targetBearingQuaternion = Quaternion.fromEulerAngles(0, this.toRadians(targetBearing), 0);

        // Combine the device orientation and target bearing quaternions
        return deviceOrientationQuaternion.clone()/*.multiply(targetBearingQuaternion)*/;
    }

    /**
     * Convert degrees to radians
     * @param degrees The angle in degrees
     * @returns The angle in radians
     */
    public toRadians(degrees: number): number {
        return degrees * (Math.PI / 180);
    }
}

// Create a singleton instance
const worldCalculationService = new WorldCalculationService();
export default worldCalculationService;