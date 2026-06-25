import Phaser from "phaser";
import { BootScene } from "./scenes/BootScene";
import { PauseScene } from "./scenes/PauseScene";
import { PreloadScene } from "./scenes/PreloadScene";
import { MiniBossScene } from "./scenes/MiniBossScene";
import { RewardScene } from "./scenes/RewardScene";
import { RunScene } from "./scenes/RunScene";
import { SecondRunScene } from "./scenes/SecondRunScene";
import { TitleScene } from "./scenes/TitleScene";
import { UIScene } from "./scenes/UIScene";

export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.CANVAS,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: "#161315",
  pixelArt: false,
  roundPixels: true,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 1200 },
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [
    BootScene,
    PreloadScene,
    TitleScene,
    RunScene,
    UIScene,
    PauseScene,
    RewardScene,
    SecondRunScene,
    MiniBossScene,
  ],
};
