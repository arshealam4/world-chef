import { useState, useEffect } from 'react';

function buildConfig() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const isPhone = w < 768;

  if (isPhone) {
    const HUD_HEIGHT    = 56;
    const BOTTOM_HEIGHT = 60;
    const canvasH = h - HUD_HEIGHT - BOTTOM_HEIGHT;
    return {
      isPhone:       true,
      layout:        'portrait',
      canvasWidth:   w,
      canvasHeight:  canvasH,
      gameWidth:     480,
      gameHeight:    854,
      tileSize:      48,
      hudHeight:     HUD_HEIGHT,
      bottomHeight:  BOTTOM_HEIGHT,
    };
  }

  const LEFT_W  = 220;
  const RIGHT_W = 280;
  const HUD_H   = 56;
  const canvasW = w - LEFT_W - RIGHT_W;
  const canvasH = h - HUD_H;
  return {
    isPhone:       false,
    layout:        'landscape',
    canvasWidth:   canvasW,
    canvasHeight:  canvasH,
    gameWidth:     Math.max(canvasW, 400),
    gameHeight:    Math.max(canvasH, 400),
    tileSize:      48,
    hudHeight:     HUD_H,
    leftPanelWidth:  LEFT_W,
    rightPanelWidth: RIGHT_W,
  };
}

export function useResponsiveCanvas() {
  const [config, setConfig] = useState(buildConfig);
  useEffect(() => {
    const handler = () => setConfig(buildConfig());
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return config;
}
