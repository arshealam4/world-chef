import * as PIXI from 'pixi.js';
import { Table } from '../entities/Table.js';
import { WalkingCustomer } from '../entities/Customer.js';

export class RestaurantScene {
  constructor(app, canvasConfig, onTableTap) {
    this.app          = app;
    this.config       = canvasConfig;
    this.onTableTap   = onTableTap;
    this.container    = new PIXI.Container();
    this.tables       = new Map();
    this.prevTableStates = new Map();
  }

  start() {
    this.drawBackground();
  }

  drawBackground() {
    const { gameWidth, gameHeight, tileSize: T } = this.config;
    const cols = Math.ceil(gameWidth / T);
    const rows = Math.ceil(gameHeight / T);

    // ── FLOOR: horizontal wood planks ──────────────────────────────
    const floor = new PIXI.Graphics();
    const plankColors = [0xD4A96A, 0xCDA05E, 0xD9B070, 0xC89858];
    for (let r = 2; r < rows; r++) {
      const plankVariant = Math.floor(r / 2) % plankColors.length;
      const color = plankColors[plankVariant];
      for (let c = 0; c < cols; c++) {
        const adj = (c % 3 === 0) ? -8 : (c % 3 === 1) ? 4 : 0;
        const hex = this.adjustColor(color, adj);
        floor.beginFill(hex);
        floor.drawRect(c * T, r * T, T, T);
        floor.endFill();
      }
    }
    this.container.addChild(floor);

    // Horizontal plank lines
    const planks = new PIXI.Graphics();
    planks.lineStyle(1, 0x8B6914, 0.2);
    for (let r = 2; r <= rows; r++) {
      planks.moveTo(0, r * T);
      planks.lineTo(gameWidth, r * T);
    }
    // Vertical grain lines — subtle, spaced widely
    planks.lineStyle(0.5, 0x8B6914, 0.08);
    for (let c = 0; c <= cols; c++) {
      planks.moveTo(c * T, T * 2);
      planks.lineTo(c * T, gameHeight);
    }
    this.container.addChild(planks);

    // ── WALL ────────────────────────────────────────────────────────
    const wall = new PIXI.Graphics();
    wall.beginFill(0x87CEEB); // sky blue
    wall.drawRect(0, 0, gameWidth, T * 1.4);
    wall.endFill();
    wall.beginFill(0xF5E6C8); // cream lower section
    wall.drawRect(0, T * 1.4, gameWidth, T * 0.6);
    wall.endFill();
    this.container.addChild(wall);

    // Wall windows
    const windowSpacing = T * 4;
    for (let x = T * 1.5; x < gameWidth - T; x += windowSpacing) {
      const win = new PIXI.Graphics();
      win.beginFill(0xFFFDE7, 0.9);
      win.lineStyle(3, 0xC8A04A, 1);
      win.drawRoundedRect(x, T * 0.1, T * 1.8, T * 1.1, 6);
      win.endFill();
      win.lineStyle(2, 0xC8A04A, 0.6);
      win.moveTo(x + T * 0.9, T * 0.1);
      win.lineTo(x + T * 0.9, T * 1.2);
      win.moveTo(x, T * 0.65);
      win.lineTo(x + T * 1.8, T * 0.65);
      this.container.addChild(win);
    }

    // ── BASEBOARD ────────────────────────────────────────────────────
    const board = new PIXI.Graphics();
    board.beginFill(0xC8A04A);
    board.drawRect(0, T * 2 - 10, gameWidth, 10);
    board.endFill();
    board.lineStyle(1.5, 0xFFD070, 0.6);
    board.moveTo(0, T * 2 - 10);
    board.lineTo(gameWidth, T * 2 - 10);
    this.container.addChild(board);
  }

  adjustColor(color, amount) {
    const r = Math.min(255, Math.max(0, ((color >> 16) & 0xFF) + amount));
    const g = Math.min(255, Math.max(0, ((color >>  8) & 0xFF) + amount));
    const b = Math.min(255, Math.max(0, ((color      ) & 0xFF) + amount));
    return (r << 16) | (g << 8) | b;
  }

  syncState(gameState) {
    if (!gameState) return;
    this.syncTables(gameState.tables || []);
  }

  syncTables(tablesData) {
    const T = this.config.tileSize;

    // Remove tables no longer in state
    for (const [tableId, table] of this.tables) {
      if (!tablesData.find(t => t.tableId === tableId)) {
        this.container.removeChild(table.container);
        table.destroy();
        this.tables.delete(tableId);
      }
    }

    // Add new or update existing
    for (const tableData of tablesData) {
      const prevState = this.prevTableStates.get(tableData.tableId);

      if (this.tables.has(tableData.tableId)) {
        // Trigger walking customer animation when table transitions empty → occupied
        if (prevState === 'empty' && tableData.state === 'occupied') {
          this.spawnWalkingCustomer(tableData, T);
        }
        this.tables.get(tableData.tableId).updateState(tableData);
      } else {
        const table = new Table(tableData, T, this.onTableTap);
        this.tables.set(tableData.tableId, table);
        this.container.addChild(table.container);
      }

      this.prevTableStates.set(tableData.tableId, tableData.state);
    }
  }

  spawnWalkingCustomer(tableData, T) {
    const targetX = tableData.position.x * T + T;
    const targetY = tableData.position.y * T + T * 0.9 - 30;

    const walker = new WalkingCustomer(
      this.app,
      targetX,
      targetY,
      () => {
        // Remove walker when arrived — table entity now shows seated customer
        this.container.removeChild(walker.container);
        walker.destroy();
      }
    );
    this.container.addChild(walker.container);
  }

  destroy() {
    for (const table of this.tables.values()) table.destroy();
    this.container.destroy({ children: true });
  }
}
