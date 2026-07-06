import Phaser from "phaser";

type PlatformAccent = "brass" | "audit" | "ember";

type PlatformOptions = {
  accent?: PlatformAccent;
  oneWay?: boolean;
};

const accentColors: Record<PlatformAccent, number> = {
  brass: 0xb88a3b,
  audit: 0x9cc7ff,
  ember: 0xffb06b,
};

export function addPaintedPlatform(
  scene: Phaser.Scene,
  platforms: Phaser.Physics.Arcade.StaticGroup,
  x: number,
  y: number,
  width: number,
  height: number,
  options: PlatformOptions = {},
): void {
  drawPaintedPlatform(scene, x, y, width, height, options.accent ?? "brass");

  const platform = scene.add.rectangle(x, y, width, height, 0x161315, 0)
    .setVisible(false);
  platforms.add(platform);

  const body = platform.body as Phaser.Physics.Arcade.StaticBody;
  body.setSize(width, height);
  body.updateFromGameObject();

  if (options.oneWay) {
    body.checkCollision.down = false;
    body.checkCollision.left = false;
    body.checkCollision.right = false;
  }
}

function drawPaintedPlatform(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
  accent: PlatformAccent,
): void {
  const graphics = scene.add.graphics().setDepth(1);
  const left = x - width / 2;
  const right = x + width / 2;
  const top = y - height / 2;
  const bottom = y + height / 2;
  const capHeight = Math.min(24, Math.max(14, height * 0.34));
  const accentColor = accentColors[accent];

  graphics.fillStyle(0x09080a, 0.48);
  graphics.fillRect(left + 10, bottom - 2, width, 12);

  graphics.fillStyle(0x3f382f, 0.96);
  graphics.fillRect(left, top, width, capHeight);
  graphics.fillStyle(0x645843, 0.78);
  graphics.fillRect(left, top, width, 5);
  graphics.lineStyle(2, accentColor, 0.72);
  graphics.lineBetween(left, top + capHeight, right, top + capHeight);

  graphics.fillStyle(0x171318, height > 50 ? 0.74 : 0.5);
  graphics.fillRect(left, top + capHeight, width, Math.max(0, height - capHeight));
  graphics.fillStyle(0x0a0809, 0.42);
  graphics.fillRect(left, bottom - 10, width, 10);

  const blockWidth = height > 70 ? 86 : 64;
  graphics.lineStyle(1, 0x9b8356, 0.34);
  for (let blockX = left + blockWidth; blockX < right; blockX += blockWidth) {
    graphics.lineBetween(blockX, top + 4, blockX - 8, top + capHeight - 3);
  }

  const stones = Math.max(3, Math.floor(width / 72));
  for (let index = 0; index < stones; index += 1) {
    const stoneX = left + 16 + index * (width / stones);
    const stoneW = Math.min(58, width / stones - 14);
    const stoneY = top + 7 + (index % 2) * 2;
    graphics.fillStyle(index % 2 === 0 ? 0x514635 : 0x463c31, 0.54);
    graphics.fillRoundedRect(stoneX, stoneY, stoneW, capHeight - 11, 2);
  }

  graphics.lineStyle(1, 0xc2aa72, 0.35);
  const crackCount = Math.max(2, Math.floor(width / 170));
  for (let index = 0; index < crackCount; index += 1) {
    const crackX = left + 42 + index * (width / crackCount);
    const crackY = top + 9 + (index % 3) * 4;
    graphics.lineBetween(crackX, crackY, crackX + 22, crackY + 4);
    graphics.lineBetween(crackX + 24, crackY + 4, crackX + 38, crackY - 1);
  }

  graphics.fillStyle(0x60723a, 0.18);
  for (let index = 0; index < Math.max(2, Math.floor(width / 220)); index += 1) {
    const mossX = left + 28 + index * 210;
    graphics.fillRect(mossX, top + capHeight - 3, 76, 5);
  }

  if (height > 50) {
    graphics.fillStyle(0x0d0a0d, 0.62);
    graphics.fillRect(left, top + capHeight + 8, width, Math.max(8, height - capHeight - 18));
  }
}
