import Phaser from "phaser";
import { AssetKeys } from "../assets";
import { GAME_HEIGHT, GAME_WIDTH } from "../GameConfig";

export class TitleScene extends Phaser.Scene {
  constructor() {
    super("TitleScene");
  }

  create(): void {
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, AssetKeys.rottenBoroughMood)
      .setDisplaySize(GAME_WIDTH, GAME_HEIGHT)
      .setAlpha(0.76);

    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x161315, 0.26);

    this.add.text(70, 72, "The Adventures of Foxman,\na Merciless Bastard", {
      fontFamily: "Georgia, serif",
      fontSize: "54px",
      color: "#e4d6a2",
      stroke: "#161315",
      strokeThickness: 8,
      lineSpacing: 4,
    });

    this.add.text(76, 240, "A grimy little revenge walk through a borough that deserves worse.", {
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: "19px",
      color: "#d4b879",
      stroke: "#161315",
      strokeThickness: 4,
    });

    this.add.rectangle(330, 430, 520, 136, 0x161315, 0.76)
      .setOrigin(0.5, 0.5)
      .setStrokeStyle(2, 0xb88a3b, 0.9);
    this.add.text(96, 376, "Controls", {
      fontFamily: "Georgia, serif",
      fontSize: "24px",
      color: "#e4d6a2",
      stroke: "#161315",
      strokeThickness: 4,
    });
    this.add.text(96, 416, "A/D or Arrows move  |  Space/W/Up jumps\nJ attacks  |  K uses skill when unlocked  |  P pauses", {
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: "17px",
      color: "#f2e7bc",
      stroke: "#161315",
      strokeThickness: 4,
      lineSpacing: 6,
    });

    this.add.text(76, 595, "Press Enter or click to start", {
      fontFamily: "Menlo, Consolas, monospace",
      fontSize: "18px",
      color: "#a6d34a",
      stroke: "#161315",
      strokeThickness: 5,
    });

    this.input.keyboard?.once("keydown-ENTER", () => this.startRun());
    this.input.once("pointerdown", () => this.startRun());

    document.body.dataset.scene = "TitleScene";
  }

  private startRun(): void {
    this.scene.start("RunScene");
    this.scene.launch("UIScene");
  }
}
