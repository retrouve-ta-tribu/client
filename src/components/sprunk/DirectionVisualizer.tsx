import {FC, useEffect, useRef, useState} from 'react';
import {
  Camera,
  GameEngineWindow,
  GameObject,
  MeshRenderBehavior,
  ObjLoader,
  Sprunk
} from "sprunk-engine";
import BasicVertexMVPWithUV from "../../shaders/BasicVertexMVPWithUVAndNormals.vert.wgsl?raw";
import BasicTextureSample from "../../shaders/BasicTextureSample-OpenGL-Like.frag.wgsl?raw";
import {DeviceOrientationData, UserPosition} from "../../services/types.ts";
import deviceOrientationService from "../../services/deviceOrientationService.ts";

interface DirectionVisualizerProps {
  position?: UserPosition;
  startPosition?: UserPosition;
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
    const camera = new GameObject("Camera");
    gameEngineWindow.root.addChild(camera);
    camera.addBehavior(new Camera());
    camera.transform.position.z = 5;

    // Créer l'objet flèche
    const arrowObject = new GameObject("Arrow");
    gameEngineWindow.root.addChild(arrowObject);
    console.log(gameEngineWindow.injectionContainer);
    ObjLoader.load("/arrow.obj").then((obj) => {
      if(arrowObject === null || arrowObject.parent === null) return;
      arrowObject.addBehavior(
          new MeshRenderBehavior(
              obj,
              "/arrow.png",
              BasicVertexMVPWithUV,
              BasicTextureSample,
          ),
      );
    });
    arrowRef.current = arrowObject;

    deviceOrientationService.startTracking((orientation) => {
      setDeviceOrientation(orientation);
    });

    // Nettoyer à la destruction
    return () => {
      gameEngineWindowRef?.dispose();
      arrowRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (arrowRef.current) {
      //arrowRef.current.transform.rotation.setFromQuaternion(direction);
    }
  }, [position, startPosition, deviceOrientation]);

  return (
      <canvas ref={canvasRef} style={{width:128+"px", height:64+"px"}}/>
  );
};

export default PageContainer;