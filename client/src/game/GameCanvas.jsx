import { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { useResponsiveCanvas } from '../hooks/useResponsiveCanvas';
import { useGameStore } from '../store/useGameStore';
import { useUIStore } from '../store/useUIStore';
import { RestaurantScene } from './scenes/RestaurantScene';

export function GameCanvas() {
  const containerRef = useRef(null);
  const appRef       = useRef(null);
  const sceneRef     = useRef(null);
  const canvasConfig = useResponsiveCanvas();
  const gameState    = useGameStore(s => s.gameState);
  const openPanel    = useUIStore(s => s.openPanel);

  // Initialize/re-initialize Pixi app when layout mode changes
  useEffect(() => {
    if (!containerRef.current) return;

    if (appRef.current) {
      if (sceneRef.current) {
        sceneRef.current.destroy();
        sceneRef.current = null;
      }
      appRef.current.destroy(true, { children: true, texture: true });
      appRef.current = null;
    }

    const app = new PIXI.Application({
      width:           canvasConfig.gameWidth,
      height:          canvasConfig.gameHeight,
      backgroundColor: 0x87CEEB,
      resolution:      Math.min(window.devicePixelRatio || 1, 2),
      autoDensity:     true,
      antialias:       true,
    });

    app.view.style.width  = canvasConfig.canvasWidth  + 'px';
    app.view.style.height = canvasConfig.canvasHeight + 'px';
    app.view.style.display = 'block';
    app.view.style.touchAction = 'auto';

    containerRef.current.appendChild(app.view);
    appRef.current = app;

    const scene = new RestaurantScene(
      app, canvasConfig,
      (tableId) => openPanel('serve', { tableId })
    );
    scene.start();
    app.stage.addChild(scene.container);
    sceneRef.current = scene;

    // Sync current gameState if already loaded
    if (gameState) {
      scene.syncState(gameState);
    }

    return () => {
      if (sceneRef.current) {
        sceneRef.current.destroy();
        sceneRef.current = null;
      }
      if (appRef.current) {
        appRef.current.destroy(true, { children: true, texture: true });
        appRef.current = null;
      }
    };
  }, [canvasConfig.layout]);

  // Sync gameState changes without re-initializing Pixi
  useEffect(() => {
    if (sceneRef.current && gameState) {
      sceneRef.current.syncState(gameState);
    }
  }, [gameState]);

  return (
    <div
      ref={containerRef}
      className="game-canvas-container"
      style={{
        width:    canvasConfig.canvasWidth,
        height:   canvasConfig.canvasHeight,
        overflow: 'hidden',
        flexShrink: 0,
      }}
    />
  );
}
