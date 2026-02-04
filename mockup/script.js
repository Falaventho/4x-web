// Hex Grid 4X Game Mockup - Phaser with cubic coordinates

// Hex grid configuration
const HEX_SIZE = 32;
const GRID_WIDTH = 10;
const GRID_HEIGHT = 8;
const CENTER_X = 600;
const CENTER_Y = 300;

// Create hex grid using cubic coordinates (q, r, s) centered at origin
// Constraint: q + r + s = 0 always
// Rows share a common r value (odd-r offset converted to cube coords)
const hexGrid = [];
const qOffset = Math.floor(GRID_WIDTH / 2);
const rOffset = Math.floor(GRID_HEIGHT / 2);

for (let row = 0; row < GRID_HEIGHT; row++) {
  for (let col = 0; col < GRID_WIDTH; col++) {
    const q = col - Math.floor((row - (row & 1)) / 2) - qOffset;
    const r = row - rOffset;
    const s = -q - r;

    hexGrid.push({
      q: q,
      r: r,
      s: s,
      id: `${q},${r},${s}`,
      type: null,
    });
  }
}

// Game state
const gameState = {
  turn: 1,
  currentPlayer: 1,
  selectedHex: null,
  hexTypes: {},
  units: {},
};

// Initialize hex types randomly
hexGrid.forEach((hex) => {
  const rand = Math.random();
  if (rand < 0.3) gameState.hexTypes[hex.id] = "water";
  else if (rand < 0.6) gameState.hexTypes[hex.id] = "grass";
  else if (rand < 0.85) gameState.hexTypes[hex.id] = "forest";
  else gameState.hexTypes[hex.id] = "mountain";
});

// Convert cubic coordinates to screen position (pointy-top hexagons)
// Rows share r, with proper horizontal staggering from r/2 term
function cubicToScreen(q, r, s) {
  const x = CENTER_X + HEX_SIZE * Math.sqrt(3) * (q + r / 2);
  const y = CENTER_Y + HEX_SIZE * 1.5 * r;
  return { x, y };
}

// Check if point is inside hex
function pointInHex(px, py, hx, hy) {
  const dx = Math.abs(px - hx);
  const dy = Math.abs(py - hy);
  return dx < HEX_SIZE * 0.75 && dy < HEX_SIZE && dx + (dy * Math.sqrt(3)) / 2 < HEX_SIZE * Math.sqrt(3);
}

// Phaser config
const config = {
  type: Phaser.CANVAS,
  width: window.innerWidth - 300,
  height: window.innerHeight,
  parent: "game-container",
  backgroundColor: "#0a0a0a",
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

const game = new Phaser.Game(config);

function preload() {}

function create() {
  const scene = this;

  // Draw hexagons
  const graphics = this.add.graphics();

  function redrawGrid() {
    graphics.clear();

    hexGrid.forEach((hex) => {
      const { x, y } = cubicToScreen(hex.q, hex.r, hex.s);

      // Color based on type
      const typeColors = {
        water: "#4a90e2",
        grass: "#2ecc71",
        forest: "#27ae60",
        mountain: "#95a5a6",
      };
      const color = typeColors[gameState.hexTypes[hex.id]] || "#666";

      graphics.fillStyle(Phaser.Display.Color.HexStringToColor(color).color, 0.8);
      drawHexagon(graphics, x, y, HEX_SIZE, true);

      // Outline selected hex
      if (gameState.selectedHex && gameState.selectedHex.id === hex.id) {
        graphics.lineStyle(3, 0xffb347);
        drawHexagon(graphics, x, y, HEX_SIZE, false);
      } else {
        graphics.lineStyle(1, 0x333333);
        drawHexagon(graphics, x, y, HEX_SIZE, false);
      }
    });
  }

  redrawGrid();

  // Mouse interaction
  this.input.on("pointerdown", (pointer) => {
    const worldX = pointer.x;
    const worldY = pointer.y;

    for (let hex of hexGrid) {
      const { x, y } = cubicToScreen(hex.q, hex.r, hex.s);
      if (pointInHex(worldX, worldY, x, y)) {
        gameState.selectedHex = hex;
        updateHexInfo(hex);
        redrawGrid();
        break;
      }
    }
  });

  // End turn button
  document.getElementById("end-turn-btn").addEventListener("click", () => {
    gameState.turn++;
    gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
    document.getElementById("turn-count").textContent = gameState.turn;
    document.getElementById("current-player").textContent = gameState.currentPlayer;
  });
}

function update() {}

function drawHexagon(graphics, cx, cy, radius, fill = true) {
  graphics.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    if (i === 0) graphics.moveTo(x, y);
    else graphics.lineTo(x, y);
  }
  graphics.closePath();
  if (fill) graphics.fillPath();
  else graphics.strokePath();
}

function updateHexInfo(hex) {
  const type = gameState.hexTypes[hex.id];
  document.getElementById("hex-coords").textContent = `(${hex.q}, ${hex.r}, ${hex.s})`;
  document.getElementById("hex-type").textContent = type.charAt(0).toUpperCase() + type.slice(1);
}

// Handle window resize
window.addEventListener("resize", () => {
  game.scale.resize(window.innerWidth - 300, window.innerHeight);
});
