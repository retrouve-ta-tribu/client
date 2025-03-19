import { FC, useEffect, useRef, useState } from 'react';
import {
  Camera,
  GameEngineWindow,
  GameObject,
  MeshRenderBehavior,
  ObjLoader,
  Sprunk, Vector3,
} from 'sprunk-engine';
import BasicVertexMVPWithUV from '../../shaders/BasicVertexMVPWithUVAndNormals.vert.wgsl?raw';
import BasicTextureSample from '../../shaders/BasicTextureSample-OpenGL-Like.frag.wgsl?raw';
import { DeviceOrientationData, UserPosition } from '../../services/types.ts';
import deviceOrientationService from '../../services/deviceOrientationService.ts';
import worldCalculationService from '../../services/worldCalculationService.ts';

interface DirectionVisualizerProps {
  position: UserPosition; // Position cible
  startPosition: UserPosition; // Position de départ
}

const PageContainer: FC<DirectionVisualizerProps> = ({ position, startPosition }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const arrowRef = useRef<GameObject | null>(null);
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
    camera.transform.position.z = 4;
    camera.transform.position.y = 4;
    camera.transform.rotation.rotateAroundAxis(Vector3.right(), -Math.PI / 4);

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
      deviceOrientationService.stopTracking();
    };
  }, []);

  // Mettre à jour la rotation de la flèche
  useEffect(() => {
    if (!arrowRef.current || !deviceOrientation || !position || !startPosition) return;

    try {
      // Calculer l'angle de la cible par rapport à la position actuelle
      const targetBearing = worldCalculationService.calculateBearing(startPosition, position);

      // Calculer la direction de la flèche en fonction de l'orientation de l'appareil
      const arrowDirection = worldCalculationService.calculateArrowDirection(
          targetBearing,
          deviceOrientation,
      );

      // Convertir l'angle en radians et appliquer la rotation à la flèche
      const angleInRadians = (arrowDirection * Math.PI) / 180;
      console.log(angleInRadians);
      arrowRef.current.transform.rotation.setFromEulerAngles(0, 0, angleInRadians);
    } catch (error) {
      console.error('Erreur lors du calcul de la direction :', error);
    }
  }, [position, startPosition, deviceOrientation]);

  return <canvas ref={canvasRef} style={{ width: '128px', height: '64px' }} />;
};

export default PageContainer;