import * as PIXI from 'pixi.js';

export class Table {
  constructor(tableData, tileSize, onTap) {
    this.data     = tableData;
    this.tileSize = tileSize;
    this.onTap    = onTap;
    this.container = new PIXI.Container();
    this.container.eventMode = 'static';
    this.container.cursor = 'pointer';
    this.container.on('pointertap', () => this.onTap(this.data.tableId));
    this._tickers = [];
    this.draw();
    this.setPosition();
  }

  draw() {
    const T  = this.tileSize;
    const cx = T;       // center x of the 2×2 tile area
    const cy = T * 0.9; // center y

    // ── DROP SHADOW ──────────────────────────────────────────────
    const shadow = new PIXI.Graphics();
    shadow.beginFill(0x000000, 0.13);
    shadow.drawEllipse(cx + 3, cy + 6, T * 0.72, T * 0.22);
    shadow.endFill();
    this.container.addChild(shadow);

    // ── TABLECLOTH (large circle, color by state) ─────────────────
    const clothColors = {
      empty:       0xFFFFFF,
      occupied:    0xFFFDE7,
      served:      0xF1F8E9,
      waiting_pay: 0xFFF9C4,
    };
    const borderColors = {
      empty:       0xE0C9A0,
      occupied:    0xFFCC02,
      served:      0x81C784,
      waiting_pay: 0xFFD600,
    };

    const clothColor  = clothColors[this.data.state]  || clothColors.empty;
    const borderColor = borderColors[this.data.state] || borderColors.empty;

    // Outer decorative ring
    const ring = new PIXI.Graphics();
    ring.beginFill(borderColor, 0.9);
    ring.drawCircle(cx, cy, T * 0.72);
    ring.endFill();
    this.container.addChild(ring);

    // Tablecloth
    const cloth = new PIXI.Graphics();
    cloth.beginFill(clothColor);
    cloth.drawCircle(cx, cy, T * 0.63);
    cloth.endFill();
    this.container.addChild(cloth);

    // Table pattern — subtle dot in center
    const center = new PIXI.Graphics();
    center.beginFill(borderColor, 0.25);
    center.drawCircle(cx, cy, T * 0.18);
    center.endFill();
    this.container.addChild(center);

    // ── CHAIRS — 4 chairs placed at NESW around the table ─────────
    this.drawChairs(cx, cy, T);

    // ── STATE-SPECIFIC VISUALS ─────────────────────────────────────
    if (this.data.state === 'occupied' && this.data.orderedDish) {
      this.drawCustomer(cx, cy, T);
      this.drawOrderBubble(cx, cy, T);
    }
    if (this.data.state === 'served') {
      this.drawCustomer(cx, cy, T);
      this.drawServedIndicator(cx, cy, T);
    }
    if (this.data.state === 'waiting_pay') {
      this.drawCustomer(cx, cy, T);
      this.drawCoinStack(cx, cy, T);
    }
    if (this.data.isVIP) {
      this.drawVIPCrown(cx, cy, T);
    }
  }

  drawChairs(cx, cy, T) {
    const r = T * 0.82; // chair orbit radius
    const positions = [
      { x: cx,         y: cy - r, rot: 0    }, // north
      { x: cx + r,     y: cy,     rot: 90   }, // east
      { x: cx,         y: cy + r, rot: 180  }, // south
      { x: cx - r,     y: cy,     rot: 270  }, // west
    ];

    for (const pos of positions) {
      const chair = new PIXI.Container();

      // Chair seat
      const seat = new PIXI.Graphics();
      seat.beginFill(0xC8956C);
      seat.lineStyle(1.5, 0x9B6B3A, 1);
      seat.drawRoundedRect(-11, -8, 22, 16, 5);
      seat.endFill();
      // Seat cushion
      seat.beginFill(0xE8B88A, 0.6);
      seat.lineStyle(0);
      seat.drawRoundedRect(-8, -5, 16, 10, 3);
      seat.endFill();
      // Chair back
      seat.beginFill(0xA07040);
      seat.lineStyle(1.5, 0x7A5020, 1);
      seat.drawRoundedRect(-10, -14, 20, 8, 4);
      seat.endFill();

      chair.addChild(seat);
      chair.x = pos.x;
      chair.y = pos.y;
      chair.rotation = (pos.rot * Math.PI) / 180;
      this.container.addChild(chair);
    }
  }

  drawCustomer(cx, cy, T) {
    const customer = new PIXI.Container();

    // Pick customer color based on tableId for variety
    const skinTones = [0xFFDBAC, 0xF1C27D, 0xE0AC69, 0xC68642, 0x8D5524];
    const hairColors = [0x2C1810, 0x6B3A2A, 0xA0522D, 0xDEB887, 0x1C1C1C, 0xFF8C00];
    const shirtColors = [0x4FC3F7, 0xEF9A9A, 0xA5D6A7, 0xFFCC02, 0xCE93D8, 0xFF8A65];

    const hash  = this.data.tableId.charCodeAt(this.data.tableId.length - 1);
    const skin  = skinTones[hash  % skinTones.length];
    const hair  = hairColors[(hash + 1) % hairColors.length];
    const shirt = shirtColors[(hash + 2) % shirtColors.length];

    // Body / torso
    const body = new PIXI.Graphics();
    body.beginFill(shirt);
    body.drawEllipse(0, 6, 10, 8);
    body.endFill();
    customer.addChild(body);

    // Neck
    const neck = new PIXI.Graphics();
    neck.beginFill(skin);
    neck.drawRect(-3, -2, 6, 6);
    neck.endFill();
    customer.addChild(neck);

    // Head
    const head = new PIXI.Graphics();
    head.beginFill(skin);
    head.lineStyle(1, this.darken(skin, 0.8), 0.5);
    head.drawCircle(0, -10, 11);
    head.endFill();
    customer.addChild(head);

    // Hair
    const hairG = new PIXI.Graphics();
    hairG.beginFill(hair);
    hairG.drawEllipse(0, -18, 10, 5);   // top hair
    hairG.drawRect(-10, -20, 20, 8);    // hair band
    hairG.endFill();
    customer.addChild(hairG);

    // Eyes
    const eyes = new PIXI.Graphics();
    eyes.beginFill(0x333333);
    eyes.drawCircle(-4, -11, 1.8);
    eyes.drawCircle(4, -11, 1.8);
    eyes.endFill();
    // Eye shine
    eyes.beginFill(0xFFFFFF);
    eyes.drawCircle(-3.2, -11.8, 0.7);
    eyes.drawCircle(4.8, -11.8, 0.7);
    eyes.endFill();
    customer.addChild(eyes);

    // Smile
    const smile = new PIXI.Graphics();
    smile.lineStyle(1.5, this.darken(skin, 0.7), 1);
    smile.arc(0, -8, 4, 0.2, Math.PI - 0.2);
    customer.addChild(smile);

    customer.x = cx;
    customer.y = cy + 2;
    customer.scale.set(0.9);

    this.container.addChild(customer);
    this._customer = customer;
  }

  drawOrderBubble(cx, cy, T) {
    const bubble = new PIXI.Container();

    // Bubble shadow
    const bShadow = new PIXI.Graphics();
    bShadow.beginFill(0x000000, 0.1);
    bShadow.drawRoundedRect(3, 3, 54, 42, 12);
    bShadow.endFill();
    bubble.addChild(bShadow);

    // Bubble body
    const bg = new PIXI.Graphics();
    bg.beginFill(0xFFFFFF, 0.97);
    bg.lineStyle(2, 0xE8D5B0, 1);
    bg.drawRoundedRect(0, 0, 54, 42, 12);
    bg.endFill();
    // Bubble tail pointing down-left toward customer
    bg.beginFill(0xFFFFFF, 0.97);
    bg.lineStyle(0);
    bg.moveTo(10, 42);
    bg.lineTo(4, 54);
    bg.lineTo(22, 42);
    bg.closePath();
    bubble.addChild(bg);

    // Dish emoji — large and clear
    const dish = new PIXI.Text(this.getDishEmoji(), {
      fontSize: 26,
      align: 'center',
    });
    dish.anchor.set(0.5);
    dish.position.set(27, 18);
    bubble.addChild(dish);

    bubble.position.set(cx - 27, cy - T * 1.15);

    // Gentle float animation
    const baseY = cy - T * 1.15;
    let t = Math.random() * Math.PI * 2;
    const tick = (delta) => {
      if (this.container.destroyed) { PIXI.Ticker.shared.remove(tick); return; }
      t += delta * 0.03;
      bubble.y = baseY + Math.sin(t) * 3;
    };
    PIXI.Ticker.shared.add(tick);
    this._tickers.push(tick);

    this.container.addChild(bubble);
    this._bubble = bubble;
  }

  drawServedIndicator(cx, cy, T) {
    // Green checkmark badge
    const badge = new PIXI.Container();

    const bg = new PIXI.Graphics();
    bg.beginFill(0x4CAF50);
    bg.lineStyle(2, 0x388E3C, 1);
    bg.drawCircle(0, 0, 16);
    bg.endFill();
    badge.addChild(bg);

    const check = new PIXI.Text('✓', {
      fontSize: 18,
      fill: '#FFFFFF',
      fontWeight: 'bold',
      fontFamily: 'Fredoka, sans-serif',
    });
    check.anchor.set(0.5);
    badge.addChild(check);

    badge.position.set(cx + T * 0.5, cy - T * 0.5);
    this.container.addChild(badge);
  }

  drawCoinStack(cx, cy, T) {
    const stack = new PIXI.Container();

    // Stack of 3 coins
    for (let i = 2; i >= 0; i--) {
      const coin = new PIXI.Graphics();
      // Coin body
      coin.beginFill(i === 0 ? 0xFFD700 : 0xFFC200);
      coin.lineStyle(1.5, 0xB8860B, 1);
      coin.drawEllipse(0, i * -5, 14, 9);
      coin.endFill();
      // Coin shine
      coin.beginFill(0xFFFFEE, 0.5);
      coin.lineStyle(0);
      coin.drawEllipse(-2, i * -5 - 1, 5, 3);
      coin.endFill();
      stack.addChild(coin);
    }

    // "$" on top coin
    const label = new PIXI.Text('$', {
      fontSize: 11,
      fill: '#7B4F00',
      fontWeight: 'bold',
      fontFamily: 'Fredoka, sans-serif',
    });
    label.anchor.set(0.5);
    label.position.set(0, -12);
    stack.addChild(label);

    const baseY = cy - T * 0.3;
    stack.position.set(cx + T * 0.48, baseY);

    // Bounce + wiggle animation
    let t = 0;
    const tick = (delta) => {
      if (this.container.destroyed) { PIXI.Ticker.shared.remove(tick); return; }
      t += delta * 0.07;
      stack.y = baseY + Math.sin(t) * 5;
      stack.rotation = Math.sin(t * 0.6) * 0.15;
    };
    PIXI.Ticker.shared.add(tick);
    this._tickers.push(tick);

    this.container.addChild(stack);
  }

  drawVIPCrown(cx, cy, T) {
    const crown = new PIXI.Text('👑', { fontSize: 16 });
    crown.anchor.set(0.5);
    crown.position.set(cx + T * 0.5, cy - T * 0.75);
    this.container.addChild(crown);
  }

  getDishEmoji() {
    const map = {
      hamburger:'🍔', cheeseburger:'🍔', steak_tartare:'🥩',
      surf_and_turf:'🍽️', caprese_salad:'🥗', breadsticks:'🥖',
      truffle_risotto:'🍚', spring_salad:'🥬', cheese_pizza:'🍕',
      pasta_meat_sauce:'🍝', pasta_carbonara:'🍝', nigiri_sushi:'🍣',
      california_maki:'🍱', miso_soup:'🍵', udon_soup:'🍜',
      nachos:'🧀', taco:'🌮', chili_with_rice:'🍲',
      stuffed_peppers:'🫑', onion_samosa:'🥟', chicken_tikka:'🍗',
      beef_vindaloo:'🍛', paella:'🥘', patatas_bravas:'🥔',
      tapas:'🍢', spanish_omelette:'🍳', hummus:'🫘', falafel:'🧆',
      couscous:'🍚', courgette_dolma:'🥒', crepe:'🥞',
      ratatouille:'🥗', filet_mignon:'🥩', lobster_bisque:'🦞',
      chocolate_cupcake:'🧁', strawberry_cupcake:'🍓',
      bretzel:'🥨', potato_salad:'🥗', rote_grutze:'🍇',
      bratwurst:'🌭', chickpea_burger:'🫘', tofu_scramble:'🍳',
      vegetarian_lasagna:'🍝', mushroom_soup:'🍄',
      dumplings:'🥟', sweet_sour_pork:'🍖', mapo_tofu:'🍲',
      fried_rice:'🍚', pho_bo:'🍜', summer_roll:'🌯',
      banh_mi:'🥖', banh_xeo:'🫔', pea_soup:'🥣',
      salmon_sandwich:'🐟', meatballs:'🍖', pad_thai:'🍜',
      spicy_shrimp_soup:'🍲', chicken_coconut:'🥥',
      thai_lobster_salad:'🦞', moussaka:'🫕', greek_salad:'🥗',
      tzatziki:'🥒', gyro:'🌯', kimchi_rice:'🍚', bulgogi:'🥩',
      bibimbap:'🍱', cold_noodles:'🍜', beef_stroganoff:'🍖',
      blini:'🥞', knish:'🥐', okroshka:'🥗', feijoada:'🫘',
      acaraje:'🥙', moqueca:'🍲', beijinho_de_coco:'🥥',
      fish_and_chips:'🐟', english_breakfast:'🍳',
      cottage_pie:'🥧', beef_wellington:'🥩',
    };
    return map[this.data.orderedDish] || '🍽️';
  }

  darken(color, factor = 0.8) {
    const r = Math.round(((color >> 16) & 0xFF) * factor);
    const g = Math.round(((color >>  8) & 0xFF) * factor);
    const b = Math.round(((color      ) & 0xFF) * factor);
    return (r << 16) | (g << 8) | b;
  }

  setPosition() {
    const T = this.tileSize;
    this.container.x = this.data.position.x * T;
    this.container.y = this.data.position.y * T;
  }

  updateState(newData) {
    this.data = newData;
    this.container.removeChildren();
    this.cleanupTickers();
    this.draw();
    this.setPosition();
  }

  cleanupTickers() {
    for (const tick of this._tickers) {
      PIXI.Ticker.shared.remove(tick);
    }
    this._tickers = [];
  }

  destroy() {
    this.cleanupTickers();
    this.container.destroy({ children: true });
  }
}
