import { FC, useState, useEffect } from 'react';
import Button from '../common/Button';

// Interface for the DeviceOrientationEvent type with requestPermission
interface DeviceOrientationEventWithPermission extends DeviceOrientationEvent {
  requestPermission?: () => Promise<string>;
}

// Interface for Window with MSStream property
interface WindowWithMSStream extends Window {
  MSStream?: unknown;
}

interface PermissionsRequestProps {
  onPermissionsGranted?: () => void;
}

const PermissionsRequest: FC<PermissionsRequestProps> = ({ onPermissionsGranted }) => {
  const [needsPermissions, setNeedsPermissions] = useState(false);
  const [requestingPermissions, setRequestingPermissions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if permissions are needed for iOS devices
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && 
      !((window as WindowWithMSStream).MSStream);
    const DeviceOrientationEventWithPermission = window.DeviceOrientationEvent as unknown as DeviceOrientationEventWithPermission;
    const needsDeviceOrientationPermission = isIOS && typeof DeviceOrientationEventWithPermission.requestPermission === 'function';
    const needsGeolocationPermission = !navigator.geolocation?.getCurrentPosition;
    
    setNeedsPermissions(needsDeviceOrientationPermission || needsGeolocationPermission);
  }, []);

  const requestPermissions = async () => {
    setRequestingPermissions(true);
    setError(null);
    
    try {
      // Request device orientation permission on iOS
      const DeviceOrientationEventWithPermission = window.DeviceOrientationEvent as unknown as DeviceOrientationEventWithPermission;
      if (typeof DeviceOrientationEventWithPermission.requestPermission === 'function') {
        const orientationPermission = await DeviceOrientationEventWithPermission.requestPermission();
        if (orientationPermission !== 'granted') {
          throw new Error("L'accès à l'orientation de l'appareil a été refusé");
        }
      }
      
      // Request geolocation permission
      await new Promise<void>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          () => resolve(),
          (err) => reject(new Error(`Erreur de géolocalisation: ${err.message}`)),
          { timeout: 10000, enableHighAccuracy: true }
        );
      });
      
      // All permissions granted
      setNeedsPermissions(false);
      if (onPermissionsGranted) {
        onPermissionsGranted();
      }
    } catch (err) {
      console.error('Erreur lors de la demande de permissions:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setRequestingPermissions(false);
    }
  };

  if (!needsPermissions) {
    return null;
  }

  return (
    <div className="mb-4 p-4 bg-yellow-50 text-yellow-800 rounded-md">
      <div className="font-medium mb-2">Permissions nécessaires</div>
      <p className="text-sm mb-3">
        Cette application nécessite l'accès à votre position et à l'orientation de votre appareil pour fonctionner correctement.
      </p>
      {error && (
        <div className="text-red-500 text-sm mb-3">
          {error}
        </div>
      )}
      <Button
        variant="primary"
        onClick={requestPermissions}
        disabled={requestingPermissions}
        className="w-full"
      >
        {requestingPermissions ? 'Demande en cours...' : 'Accorder les permissions'}
      </Button>
    </div>
  );
};

export default PermissionsRequest; 