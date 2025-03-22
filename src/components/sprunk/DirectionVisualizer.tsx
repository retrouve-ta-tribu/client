import { FC, useEffect, useRef, useState } from 'react';
import {
  Camera,
  GameEngineWindow,
  GameObject,
  MeshRenderBehavior,
  ObjLoader,
  Quaternion,
  Sprunk, Vector3,
} from 'sprunk-engine';
import BasicVertexMVPWithUV from '../../shaders/BasicVertexMVPWithUVAndNormals.vert.wgsl?raw';
import BasicTextureSample from '../../shaders/BasicTextureSample-OpenGL-Like.frag.wgsl?raw';
import { DeviceOrientationData, Position } from '../../services/types.ts';
import deviceOrientationService from '../../services/deviceOrientationService.ts';
import worldCalculationService from '../../services/worldCalculationService.ts';

interface DirectionVisualizerProps {
  position: Position;
  startPosition: Position;
  arrowTexture?: string;
}

const PageContainer: FC<DirectionVisualizerProps> = ({ position, startPosition, arrowTexture = '/arrow.png' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const arrowRef = useRef<GameObject | null>(null);
  const cameraRef = useRef<GameObject | null>(null);
  const [deviceOrientation, setDeviceOrientation] = useState<DeviceOrientationData | null>(null);

  // Game initialization (only on mount)
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;

    // Initialize Sprunk game
    const gameEngineWindow: GameEngineWindow | null = Sprunk.newGame(canvas, false, [
      'RenderGameEngineComponent',
    ]);
    const gameEngineWindowRef = gameEngineWindow;

    // Create camera
    const camera = new GameObject('Camera');
    gameEngineWindow.root.addChild(camera);
    camera.addBehavior(new Camera(Math.PI / 3.5));
    camera.transform.position.z = 5;
    cameraRef.current = camera;

    // Create arrow object
    const arrowObject = new GameObject('Arrow');
    gameEngineWindow.root.addChild(arrowObject);
    ObjLoader.load('/arrow.obj').then((obj) => {
      if (arrowObject === null || arrowObject.parent === null) return;
      arrowObject.addBehavior(
          new MeshRenderBehavior(obj, arrowTexture, BasicVertexMVPWithUV, BasicTextureSample),
      );
    });
    arrowRef.current = arrowObject;

    // Start tracking device orientation
    deviceOrientationService.startTracking((orientation) => {
      setDeviceOrientation(orientation);
    });

    // Clean up on destruction
    return () => {
      gameEngineWindowRef?.dispose();
      arrowRef.current = null;
      cameraRef.current = null;
      deviceOrientationService.stopTracking();
    };
  }, [arrowTexture]);

  // Update arrow rotation
  useEffect(() => {
    if (!arrowRef.current || !cameraRef.current || !deviceOrientation || !position || !startPosition) return;

    try {
      // Calculate target angle relative to current position
      const targetBearing = worldCalculationService.calculateBearing(startPosition, position);

      // Calculate arrow direction based on device orientation
      const arrowDirection = worldCalculationService.calculateArrowDirection(
          targetBearing,
          deviceOrientation,
      ).multiply(Quaternion.fromAxisAngle(Vector3.up(), Math.PI / 2))

      const betaRad = deviceOrientation.beta ? worldCalculationService.toRadians(270 + deviceOrientation.beta) : -Math.PI / 4;
      const positionZ = Math.cos(betaRad) * 4;
      const positionY = -Math.sin(betaRad) * 4;

      const cameraOrientation = Quaternion.fromAxisAngle(new Vector3(1, 0, 0), betaRad);
      cameraRef.current.transform.rotation.setFromQuaternion(cameraOrientation)
      cameraRef.current.transform.position.set(0, positionY, positionZ);

      // Convert angle to radians and apply rotation to the arrow
      arrowRef.current.transform.rotation.setFromQuaternion(arrowDirection);
    } catch (error) {
      console.error('Error calculating direction:', error);
    }
  }, [position, startPosition, deviceOrientation]);

  return <canvas ref={canvasRef} style={{ width: '80px', height: '60px' }} />;
};

export default PageContainer;