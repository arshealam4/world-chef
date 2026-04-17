import * as PIXI from 'pixi.js';

export function spawnCoinFloat(stage, x, y, amount) {
  // Multiple coins burst outward
  const coinCount = Math.min(5, Math.max(2, Math.floor(amount / 4)));

  for (let i = 0; i < coinCount; i++) {
    const coin = new PIXI.Container();

    // Coin disc
    const disc = new PIXI.Graphics();
    disc.beginFill(0xFFD700);
    disc.lineStyle(1.5, 0xB8860B, 1);
    disc.drawCircle(0, 0, 9);
    disc.endFill();
    disc.beginFill(0xFFFFAA, 0.5);
    disc.lineStyle(0);
    disc.drawCircle(-2, -2, 4);
    disc.endFill();
    coin.addChild(disc);

    const label = new PIXI.Text('$', {
      fontSize: 10, fill: '#7B4F00', fontWeight: 'bold',
      fontFamily: 'Fredoka, sans-serif',
    });
    label.anchor.set(0.5);
    coin.addChild(label);

    coin.x = x + (Math.random() - 0.5) * 20;
    coin.y = y;
    stage.addChild(coin);

    // Each coin flies in a different arc
    const angle  = (-Math.PI / 2) + (Math.random() - 0.5) * Math.PI;
    const speed  = 2 + Math.random() * 2;
    const vx     = Math.cos(angle) * speed;
    let   vy     = Math.sin(angle) * speed - 3;
    let   frames = 0;
    const gravity = 0.15;

    const tick = (delta) => {
      if (coin.destroyed) { PIXI.Ticker.shared.remove(tick); return; }

      frames += delta;
      vy     += gravity * delta;
      coin.x += vx * delta;
      coin.y += vy * delta;
      coin.alpha = Math.max(0, 1 - frames / 55);
      coin.rotation += 0.1 * delta;

      if (frames >= 55) {
        PIXI.Ticker.shared.remove(tick);
        if (!coin.destroyed) {
          if (coin.parent) stage.removeChild(coin);
          coin.destroy();
        }
      }
    };
    PIXI.Ticker.shared.add(tick);
  }

  // "+N coins" text
  const text = new PIXI.Text(`+${amount}`, {
    fontSize: 22,
    fill: '#FFD700',
    stroke: '#7B4F00',
    strokeThickness: 3,
    fontWeight: 'bold',
    fontFamily: 'Fredoka, sans-serif',
  });
  text.anchor.set(0.5);
  text.x = x;
  text.y = y - 10;
  stage.addChild(text);

  let elapsed = 0;
  const textTick = (delta) => {
    if (text.destroyed) { PIXI.Ticker.shared.remove(textTick); return; }

    elapsed    += delta;
    text.y     -= 1.2 * delta;
    text.alpha  = Math.max(0, 1 - elapsed / 50);
    text.scale.set(1 + elapsed * 0.01);

    if (elapsed >= 50) {
      PIXI.Ticker.shared.remove(textTick);
      if (!text.destroyed) {
        if (text.parent) stage.removeChild(text);
        text.destroy();
      }
    }
  };
  PIXI.Ticker.shared.add(textTick);
}
