import Phaser from "phaser";
import { AssetKeys } from "../assets";

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

const accentTints: Record<PlatformAccent, number> = {
  brass: 0xffffff,
  audit: 0xd7eaff,
  ember: 0xffd1a8,
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
  drawAtlasPlatform(scene, x, y, width, height, options.accent ?? "brass", Boolean(options.oneWay));

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

function drawAtlasPlatform(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
  accent: PlatformAccent,
  oneWay: boolean,
): void {
  const graphics = scene.add.graphics().setDepth(0.9);
  const left = x - width / 2;
  const right = x + width / 2;
  const top = y - height / 2;
  const bottom = y + height / 2;
  const capHeight = oneWay ? Math.min(40, height + 26) : Math.min(56, Math.max(28, height * 0.42));
  const accentColor = accentColors[accent];

  graphics.fillStyle(0x050506, oneWay ? 0.3 : 0.58);
  graphics.fillRect(left + 10, bottom - 3, width, oneWay ? 10 : 18);

  if (!oneWay) {
    graphics.fillStyle(0x111014, 0.72);
    graphics.fillRect(left, top + capHeight - 4, width, Math.max(0, height - capHeight + 4));
    graphics.fillStyle(0x0a080a, 0.76);
    graphics.fillRect(left, bottom - 18, width, 18);
  }

  const textureKey = AssetKeys.rottenBoroughTiles;
  const frameName = oneWay ? "woodLong" : "stoneLong";
  const frame = scene.textures.getFrame(textureKey, frameName);
  if (!frame) {
    drawFallbackPlatform(graphics, left, right, top, bottom, capHeight, accentColor, height);
    return;
  }

  const targetHeight = oneWay ? Math.max(62, height + 30) : capHeight + 28;
  const scale = targetHeight / frame.height;
  const sourceSegmentWidth = frame.width * scale;
  const segmentCount = Math.max(1, Math.ceil(width / sourceSegmentWidth));
  const segmentWidth = width / segmentCount;
  const segmentY = top + (oneWay ? height * 0.18 : capHeight * 0.54);

  for (let index = 0; index < segmentCount; index += 1) {
    const segment = scene.add.image(
      left + segmentWidth * index + segmentWidth / 2,
      segmentY,
      textureKey,
      frameName,
    )
      .setOrigin(0.5, 0.5)
      .setDepth(1.05)
      .setTint(accentTints[accent]);
    segment.displayWidth = segmentWidth + 10;
    segment.displayHeight = targetHeight;
  }

  if (!oneWay && width > 700) {
    const grimeCount = Math.floor(width / 210);
    for (let index = 0; index < grimeCount; index += 1) {
      scene.add.image(left + 104 + index * 210, top + capHeight + 34, textureKey, "stoneTiny")
        .setOrigin(0.5, 0.5)
        .setDepth(1)
        .setAlpha(0.48)
        .setTint(accentTints[accent])
        .setScale(0.8);
    }
  }

  graphics.lineStyle(oneWay ? 2 : 3, accentColor, oneWay ? 0.72 : 0.5);
  graphics.lineBetween(left + 4, top + height * 0.5, right - 4, top + height * 0.5);
}

function drawFallbackPlatform(
  graphics: Phaser.GameObjects.Graphics,
  left: number,
  right: number,
  top: number,
  bottom: number,
  capHeight: number,
  accentColor: number,
  height: number,
): void {
  const width = right - left;
  graphics.fillStyle(0x09080a, 0.48);
  graphics.fillRect(left + 10, bottom - 2, width, 12);
  graphics.fillStyle(0x3f382f, 0.96);
  graphics.fillRect(left, top, width, capHeight);
  graphics.lineStyle(2, accentColor, 0.72);
  graphics.lineBetween(left, top + capHeight, right, top + capHeight);
  if (height > 50) {
    graphics.fillStyle(0x0d0a0d, 0.62);
    graphics.fillRect(left, top + capHeight + 8, width, Math.max(8, height - capHeight - 18));
  }
}
