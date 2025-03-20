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
}

const PageContainer: FC<DirectionVisualizerProps> = ({ position, startPosition }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const arrowRef = useRef<GameObject | null>(null);
  const cameraRef = useRef<GameObject | null>(null);
  const [deviceOrientation, setDeviceOrientation] = useState<DeviceOrientationData | null>(null);

  // Initialisation du jeu (uniquement au montage)
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;

    // Initialiser le jeu Sprunk
    const gameEngineWindow: GameEngineWindow | null = Sprunk.newGame(canvas, false, [
      'RenderGameEngineComponent',
    ]);
    const gameEngineWindowRef = gameEngineWindow;

    // Créer la caméra
    const camera = new GameObject('Camera');
    gameEngineWindow.root.addChild(camera);
    camera.addBehavior(new Camera(Math.PI / 6));
    camera.transform.position.z = 5;
    cameraRef.current = camera;

    // Créer l'objet flèche
    const arrowObject = new GameObject('Arrow');
    gameEngineWindow.root.addChild(arrowObject);
    ObjLoader.load('/arrow.obj').then((obj) => {
      if (arrowObject === null || arrowObject.parent === null) return;
      arrowObject.addBehavior(
          new MeshRenderBehavior(obj, '/arrow.png', BasicVertexMVPWithUV, BasicTextureSample),
      );
    });
    arrowRef.current = arrowObject;

    // Démarrer le suivi de l'orientation de l'appareil
    deviceOrientationService.startTracking((orientation) => {
      setDeviceOrientation(orientation);
    });

    // Nettoyer à la destruction
    return () => {
      gameEngineWindowRef?.dispose();
      arrowRef.current = null;
      cameraRef.current = null;
      deviceOrientationService.stopTracking();
    };
  }, []);

  // Mettre à jour la rotation de la flèche
  useEffect(() => {
    if (!arrowRef.current || !cameraRef.current || !deviceOrientation || !position || !startPosition) return;

    try {
      // Calculer l'angle de la cible par rapport à la position actuelle
      const targetBearing = worldCalculationService.calculateBearing(startPosition, position);

      // Calculer la direction de la flèche en fonction de l'orientation de l'appareil
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

      // Convertir l'angle en radians et appliquer la rotation à la flèche
      console.log(arrowDirection);
      arrowRef.current.transform.rotation.setFromQuaternion(arrowDirection);
    } catch (error) {
      console.error('Erreur lors du calcul de la direction :', error);
    }
  }, [position, startPosition, deviceOrientation]);

  return <canvas ref={canvasRef} style={{ width: '80px', height: '80px' }} />;
};

export default PageContainer;