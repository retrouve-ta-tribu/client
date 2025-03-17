import { FC, useEffect, useRef } from 'react';
import {
  Camera,
  GameEngineWindow,
  GameObject,
  MeshRenderBehavior,
  ObjLoader,
  Quaternion,
  RenderGameEngineComponent,
  Sprunk
} from "sprunk-engine";
import BasicVertexMVPWithUV from "../../shaders/BasicVertexMVPWithUVAndNormals.vert.wgsl?raw";
import BasicTextureSample from "../../shaders/BasicTextureSample-OpenGL-Like.frag.wgsl?raw";

interface DirectionVisualizerProps {
  direction: Quaternion;
}

const PageContainer: FC<DirectionVisualizerProps> = ({ direction }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameEngineWindowRef = useRef<GameEngineWindow | null>(null);
  const cameraRef = useRef<GameObject | null>(null);

  // Initialisation du jeu (uniquement au montage)
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;

    // Initialiser le jeu Sprunk
    const gameEngineWindow: GameEngineWindow | null = Sprunk.newGame(canvas, false, [
      'RenderGameEngineComponent',
    ]);
    gameEngineWindowRef.current = gameEngineWindow;

    const renderComponent: RenderGameEngineComponent | null = gameEngineWindow.getEngineComponent(RenderGameEngineComponent)!;

    // Créer la caméra
    const camera = new GameObject("Camera");
    camera.addBehavior(new Camera(renderComponent));
    camera.transform.position.z = 5;
    cameraRef.current = camera; // Stocker la référence de la caméra
    gameEngineWindow.root.addChild(camera);

    // Créer l'objet flèche
    const arrowObject = new GameObject("Arrow");
    ObjLoader.load("/arrow.obj").then((obj) => {
      arrowObject.addBehavior(
          new MeshRenderBehavior(
              renderComponent,
              obj,
              "/arrow.png",
              BasicVertexMVPWithUV,
              BasicTextureSample,
          ),
      );
    });
    gameEngineWindow.root.addChild(arrowObject);

    // Nettoyer à la destruction
    return () => {
      gameEngineWindowRef.current?.dispose();
      gameEngineWindowRef.current = null;
      cameraRef.current = null;
    };
  }, []); // Le tableau de dépendances vide garantit que cela ne s'exécute qu'une fois

  // Mettre à jour la rotation de la caméra lorsque `direction` change
  useEffect(() => {
    if (cameraRef.current) {
      cameraRef.current.transform.rotation = direction; // Mettre à jour la rotation
    }
  }, [direction]); // Ce useEffect dépend de `direction`

  return (
      <canvas ref={canvasRef} style={{width:128+"px", height:64+"px"}}/>
  );
};

export default PageContainer;