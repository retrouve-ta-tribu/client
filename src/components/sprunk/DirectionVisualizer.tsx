import {FC, useEffect, useRef} from 'react';
import {GameEngineWindow, Quaternion, RenderGameEngineComponent, Sprunk} from "sprunk-engine";

interface DirectionVisualizerProps {
  direction: Quaternion;
}

const PageContainer: FC<DirectionVisualizerProps> = ({ direction }) => {

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;

    // Initialize the Sprunk engine
    let gameEngineWindow: GameEngineWindow | null = Sprunk.newGame(canvas, false, [
      'RenderGameEngineComponent',
    ]);
    let renderComponent: RenderGameEngineComponent | null  = gameEngineWindow.getEngineComponent(RenderGameEngineComponent)!;

    //Free resources
    return () => {
      gameEngineWindow?.dispose();
      gameEngineWindow = null;
      renderComponent = null;
    };
  });

  return (
      <div className="max-w-2xl mx-auto bg-white shadow-sm min-h-screen">
        <canvas ref={canvasRef} id="sprunk-canvas" className="w-full h-full" />
      </div>
  );
};

export default PageContainer; 