import { FC, useEffect, useRef} from 'react';
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

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;

    // Initialize the Sprunk engine
    const gameEngineWindow: GameEngineWindow | null = Sprunk.newGame(canvas, false, [
      'RenderGameEngineComponent',
    ]);
    const renderComponent: RenderGameEngineComponent | null  = gameEngineWindow.getEngineComponent(RenderGameEngineComponent)!;
    const camera = new GameObject("Camera");
    camera.addBehavior(new Camera(renderComponent));
    camera.transform.position.z = 5;
    gameEngineWindow.root.addChild(camera);

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

    //Free resources
    return () => {
      gameEngineWindow?.dispose();
    };
  });

  return (
      <canvas ref={canvasRef} className="w-full h-full" width={100} height={100} />
  );
};

export default PageContainer; 