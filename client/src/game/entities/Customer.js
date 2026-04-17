import * as PIXI from 'pixi.js';

// Standalone walking customer — animates from bottom of screen to a table
export class WalkingCustomer {
  constructor(app, targetX, targetY, onArrived) {
    this.app       = app;
    this.targetX   = targetX;
    this.targetY   = targetY;
    this.onArrived = onArrived;
    this.container = new PIXI.Container();
    this._tickers  = [];
    this.draw();
    this.startWalk();
  }

  draw() {
    // Same cartoon customer drawing as in Table.js but standalone
    const colors = [
      { skin: 0xFFDBAC, hair: 0x2C1810, shirt: 0x4FC3F7 },
      { skin: 0xF1C27D, hair: 0xFF8C00, shirt: 0xEF9A9A },
      { skin: 0xE0AC69, hair: 0x6B3A2A, shirt: 0xA5D6A7 },
      { skin: 0xC68642, hair: 0x1C1C1C, shirt: 0xFFCC02 },
      { skin: 0x8D5524, hair: 0x2C1810, shirt: 0xCE93D8 },
    ];
    const c = colors[Math.floor(Math.random() * colors.length)];

    // Shadow
    const shadow = new PIXI.Graphics();
    shadow.beginFill(0x000000, 0.12);
    shadow.drawEllipse(0, 18, 12, 4);
    shadow.endFill();
    this.container.addChild(shadow);

    // Body
    const body = new PIXI.Graphics();
    body.beginFill(c.shirt);
    body.drawEllipse(0, 8, 11, 10);
    body.endFill();
    this.container.addChild(body);

    // Neck
    const neck = new PIXI.Graphics();
    neck.beginFill(c.skin);
    neck.drawRect(-3, 0, 6, 8);
    neck.endFill();
    this.container.addChild(neck);

    // Head
    const head = new PIXI.Graphics();
    head.beginFill(c.skin);
    head.lineStyle(1, 0x000000, 0.15);
    head.drawCircle(0, -10, 13);
    head.endFill();
    this.container.addChild(head);

    // Hair
    const hair = new PIXI.Graphics();
    hair.beginFill(c.hair);
    hair.drawEllipse(0, -19, 12, 7);
    hair.drawRect(-12, -22, 24, 10);
    hair.endFill();
    this.container.addChild(hair);

    // Eyes
    const eyes = new PIXI.Graphics();
    eyes.beginFill(0x333333);
    eyes.drawCircle(-4, -12, 2);
    eyes.drawCircle(4, -12, 2);
    eyes.endFill();
    eyes.beginFill(0xFFFFFF);
    eyes.drawCircle(-3, -13, 0.8);
    eyes.drawCircle(5, -13, 0.8);
    eyes.endFill();
    this.container.addChild(eyes);

    // Smile
    const smile = new PIXI.Graphics();
    smile.lineStyle(1.8, 0x885533, 1);
    smile.arc(0, -7, 5, 0.2, Math.PI - 0.2);
    this.container.addChild(smile);

    // Walking legs (two rectangles that animate)
    this._leg1 = new PIXI.Graphics();
    this._leg1.beginFill(c.shirt);
    this._leg1.drawRoundedRect(-6, 16, 7, 14, 3);
    this._leg1.endFill();
    this.container.addChild(this._leg1);

    this._leg2 = new PIXI.Graphics();
    this._leg2.beginFill(c.shirt);
    this._leg2.drawRoundedRect(0, 16, 7, 14, 3);
    this._leg2.endFill();
    this.container.addChild(this._leg2);

    this.container.scale.set(1.1);
  }

  startWalk() {
    // Start below the canvas
    this.container.x = this.targetX;
    this.container.y = this.app.renderer.height + 60;

    const speed   = 2.5;
    let walkFrame = 0;

    const tick = (delta) => {
      if (this.container.destroyed) { PIXI.Ticker.shared.remove(tick); return; }

      const dy = this.targetY - this.container.y;

      if (Math.abs(dy) < speed + 1) {
        // Arrived
        this.container.y = this.targetY;
        PIXI.Ticker.shared.remove(tick);
        this._tickers = this._tickers.filter(t => t !== tick);
        // Remove legs (customer is now seated)
        if (this._leg1) { this.container.removeChild(this._leg1); this._leg1.destroy(); this._leg1 = null; }
        if (this._leg2) { this.container.removeChild(this._leg2); this._leg2.destroy(); this._leg2 = null; }
        if (this.onArrived) this.onArrived();
        return;
      }

      this.container.y += (dy > 0 ? 1 : -1) * speed * delta;

      // Leg swing animation
      walkFrame += delta * 0.25;
      if (this._leg1) this._leg1.x = Math.sin(walkFrame) * 3;
      if (this._leg2) this._leg2.x = Math.sin(walkFrame + Math.PI) * 3;

      // Subtle body bob
      this.container.rotation = Math.sin(walkFrame * 2) * 0.04;
    };

    PIXI.Ticker.shared.add(tick);
    this._tickers.push(tick);
  }

  destroy() {
    for (const tick of this._tickers) PIXI.Ticker.shared.remove(tick);
    this._tickers = [];
    this.container.destroy({ children: true });
  }
}
