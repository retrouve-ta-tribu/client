import { FC, useEffect, useRef } from 'react';
import {
  Camera,
  GameEngineWindow,
  GameObject,
  MeshRenderBehavior,
  ObjLoader,
  Quaternion,
  Sprunk
} from "sprunk-engine";
import BasicVertexMVPWithUV from "../../shaders/BasicVertexMVPWithUVAndNormals.vert.wgsl?raw";
import BasicTextureSample from "../../shaders/BasicTextureSample-OpenGL-Like.frag.wgsl?raw";

interface DirectionVisualizerProps {
  direction: Quaternion;
}

const PageContainer: FC<DirectionVisualizerProps> = ({ direction }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const arrowRef = useRef<GameObject | null>(null);

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

    // Nettoyer à la destruction
    return () => {
      gameEngineWindowRef?.dispose();
      arrowRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (arrowRef.current) {
      arrowRef.current.transform.rotation.setFromQuaternion(direction);
    }
  }, [direction]);

  return (
      <canvas ref={canvasRef} style={{width:128+"px", height:64+"px"}}/>
  );
};

export default PageContainer;