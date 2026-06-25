import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../GameConfig";

export class PauseScene extends Phaser.Scene {
  constructor() {
    super("PauseScene");
  }

  create(): void {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x161315, 0.54);
    this.add.text(GAME_WIDTH / 2, 292, "PAUSED", {
      fontFamily: "Georgia, serif",
      fontSize: "48px",
      color: "#e4d6a2",
      stroke: "#161315",
      strokeThickness: 7,
    }).setOrigin(0.5, 0.5);

    this.add.text(GAME_WIDTH / 2, 356, "Press P, Esc, or Enter to resume", {
      fontFamily: "Menlo, Consolas, monospace",
      fontSize: "18px",
      color: "#a6d34a",
      stroke: "#161315",
      strokeThickness: 5,
    }).setOrigin(0.5, 0.5);

    document.body.dataset.paused = "true";
    window.__FOXMAN_RESUME__ = () => this.resumeRun();

    this.input.keyboard?.once("keydown-P", () => this.resumeRun());
    this.input.keyboard?.once("keydown-ESC", () => this.resumeRun());
    this.input.keyboard?.once("keydown-ENTER", () => this.resumeRun());
  }

  private resumeRun(): void {
    document.body.dataset.paused = "false";
    this.scene.resume("RunScene");
    this.scene.stop();
  }
}
