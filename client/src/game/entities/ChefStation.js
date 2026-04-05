import * as PIXI from 'pixi.js';

const CHEF_COLORS = {
  grill_helper:      0xE8A87C,
  dough_helper:      0xF5DEB3,
  stove_helper:      0xB0C4DE,
  milk_helper:       0xFFF8DC,
  grill_chef:        0xFF8C69,
  american_chef:     0xFF8C69,
  antipasti_chef:    0x98D8A0,
  italian_chef:      0xFF6347,
  japanese_chef:     0xFF69B4,
  mexican_chef:      0x32CD32,
  indian_chef:       0xFFA500,
  spanish_chef:      0xFFD700,
  arabian_chef:      0xDEB887,
  french_chef:       0x87CEEB,
  cupcake_chef:      0xFFB6C1,
  german_chef:       0xD2B48C,
  vegetarian_chef:   0x90EE90,
  chinese_chef:      0xFF4500,
  vietnam_chef:      0x98FB98,
  scandinavian_chef: 0xADD8E6,
  thai_chef:         0xFFD700,
  greek_chef:        0x87CEEB,
  korean_chef:       0xFFA07A,
  russian_chef:      0xDDA0DD,
  brazilian_chef:    0x32CD32,
  english_chef:      0xF0E68C,
};

const CHEF_EMOJIS = {
  grill_helper: '🔥', dough_helper: '🌾', stove_helper: '🍳', milk_helper: '🥛',
  american_chef: '🍔', antipasti_chef: '🥗', italian_chef: '🍕',
  japanese_chef: '🍣', mexican_chef: '🌮', indian_chef: '🍛',
  spanish_chef: '🥘', arabian_chef: '🧆', french_chef: '🥐',
  cupcake_chef: '🧁', german_chef: '🥨', vegetarian_chef: '🥦',
  chinese_chef: '🥟', vietnam_chef: '🍜', scandinavian_chef: '🐟',
  thai_chef: '🍲', greek_chef: '🫒', korean_chef: '🍱',
  russian_chef: '🥣', brazilian_chef: '🫘', english_chef: '🥧',
};

export class ChefStation {
  constructor(chefData, tileSize, onTap) {
    this.data      = chefData;
    this.tileSize  = tileSize;
    this.onTap     = onTap;
    this.container = new PIXI.Container();
    this.container.eventMode = 'static';
    this.container.cursor = 'pointer';
    this.container.on('pointertap', () => this.onTap(chefData.chefId));
    this.draw();
    this.updatePosition();
  }

  draw() {
    const T = this.tileSize;
    const color = CHEF_COLORS[this.data.chefId] || 0xCCCCCC;

    // Drop shadow
    const shadow = new PIXI.Graphics();
    shadow.beginFill(0x000000, 0.15);
    shadow.drawRoundedRect(4, 5, T * 2 - 4, T * 2 - 2, 14);
    shadow.endFill();
    this.container.addChild(shadow);

    // Main body with bevel
    const base = new PIXI.Graphics();
    base.beginFill(this.darken(color, 0.65));
    base.drawRoundedRect(1, 1, T * 2 - 2, T * 2 - 2, 14);
    base.endFill();
    base.beginFill(color, 0.9);
    base.drawRoundedRect(2, 2, T * 2 - 4, T * 2 - 4, 13);
    base.endFill();
    this.container.addChild(base);

    // Top highlight (half-height white overlay)
    const highlight = new PIXI.Graphics();
    highlight.beginFill(0xFFFFFF, 0.2);
    highlight.drawRoundedRect(6, 6, T * 2 - 12, T - 6, 10);
    highlight.endFill();
    this.container.addChild(highlight);

    // Bottom shade for grounding
    const shade = new PIXI.Graphics();
    shade.beginFill(0x000000, 0.08);
    shade.drawRoundedRect(4, T * 2 - 20, T * 2 - 8, 16, 8);
    shade.endFill();
    this.container.addChild(shade);

    const emoji = new PIXI.Text(
      CHEF_EMOJIS[this.data.chefId] || '👨‍🍳',
      { fontSize: 28 }
    );
    emoji.anchor.set(0.5);
    emoji.position.set(T, T + 4);
    this.container.addChild(emoji);

    // Slot dots — two-layer "socket" look
    for (let i = 0; i < this.data.slots; i++) {
      const dotOuter = new PIXI.Graphics();
      dotOuter.beginFill(this.darken(color, 0.7), 0.6);
      dotOuter.drawCircle(0, 0, 5);
      dotOuter.endFill();
      dotOuter.position.set(T - (this.data.slots - 1) * 6 + i * 12, T * 2 - 11);
      this.container.addChild(dotOuter);

      const dotInner = new PIXI.Graphics();
      dotInner.beginFill(0xFFFFFF, 0.85);
      dotInner.drawCircle(0, 0, 3.5);
      dotInner.endFill();
      dotInner.position.set(T - (this.data.slots - 1) * 6 + i * 12, T * 2 - 11);
      this.container.addChild(dotInner);
    }

    // Tap animation — scale bounce
    this.container.on('pointerdown', () => {
      this.container.scale.set(0.95);
      setTimeout(() => { this.container.scale.set(1.0); }, 120);
    });
  }

  darken(color, factor = 0.7) {
    const r = ((color >> 16) & 0xFF) * factor;
    const g = ((color >>  8) & 0xFF) * factor;
    const b = ((color      ) & 0xFF) * factor;
    return (Math.round(r) << 16) | (Math.round(g) << 8) | Math.round(b);
  }

  updatePosition() {
    const T = this.tileSize;
    this.container.x = this.data.position.x * T;
    this.container.y = this.data.position.y * T;
  }

  destroy() {
    this.container.destroy({ children: true });
  }
}
